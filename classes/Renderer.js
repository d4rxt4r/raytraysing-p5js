import { setImagePixel } from '../utils/image.js';
import { randomInt } from '../utils/math.js';
import { calculateZoom } from '../utils/canvas.js';

export default class Renderer {
   constructor(canvas) {
      if (!canvas) {
         throw new Error('Canvas not provided!');
      }
      this._imageWidth = canvas.width;
      this._imageHeight = canvas.height;

      this._threads = 4;
      this._workers = [];
      this._workersReady = false;
      this._workersReadyCount = 0;

      this._chunks = 64;
      this._currentChunk = 0;

      this._chunkCols = Math.ceil(Math.sqrt(this._chunks));
      this._chunkRows = Math.ceil(this._chunks / this._chunkCols);

      this._chunkWidth = Math.ceil(canvas.width / this._chunkCols);
      this._chunkHeight = Math.ceil(canvas.height / this._chunkRows);

      this._t0;

      this._initContext(canvas);
      this._initWorkers();
      this._initCamera();
      this._initImageData();
   }

   resizeCanvas(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.style.zoom = calculateZoom(w);

      this._imageWidth = w;
      this._imageHeight = h;

      this._chunkWidth = Math.ceil(this.canvas.width / this._chunkCols);
      this._chunkHeight = Math.ceil(this.canvas.height / this._chunkRows);

      this._initCamera();
      this._initImageData();
   }

   get pixels() {
      return this.imageData.data;
   }

   get chunkCoords() {
      return {
         x: this._currentChunk % this._chunkCols,
         y: Math.floor(this._currentChunk / this._chunkCols)
      };
   }

   getChunkInterval() {
      return {
         startX: this.chunkCoords.x * this._chunkWidth,
         startY: this.chunkCoords.y * this._chunkHeight,
         endX: this.chunkCoords.x * this._chunkWidth + this._chunkWidth,
         endY: this.chunkCoords.y * this._chunkHeight + this._chunkHeight
      };
   }

   _initContext(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
   }

   _initWorkers() {
      for (let i = 0; i < this._threads; i++) {
         const worker = new Worker('render.worker.js', { type: 'module' });
         worker.onmessage = (e) => {
            const { x, y, color } = e.data;
            setImagePixel(this.pixels, x, y, this.canvas.width, color);
            this.ctx.putImageData(this.imageData, 0, 0);
         };

         this._workers.push(worker);
      }
   }

   _initCamera() {
      this._workers.forEach((worker) => {
         worker.postMessage({
            action: 'initCamera',
            camera: {
               imageWidth: this._imageWidth,
               imageHeight: this._imageHeight
            }
         });
      });
   }

   _initImageData() {
      this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
   }

   render() {
      if (this._currentChunk === this._chunks) {
         this._currentChunk = 0;
         console.info('ℹ️ Generation took: ' + (performance.now() - this._t0).toFixed(2) + 'ms');
         return;
      }

      if (this._currentChunk === 0) {
         this._t0 = performance.now();
      }

      const { startX = 0, startY = 0, endX = this._imageWidth, endY = this._imageHeight } = this.getChunkInterval();

      for (let y = startY; y < endY; y++) {
         for (let x = startX; x < endX; x++) {
            this._workers[randomInt(0, this._workers.length - 1)].postMessage({
               action: 'render',
               x,
               y
            });
         }
      }

      this._currentChunk++;

      requestAnimationFrame(() => {
         this.render();
      });
   }

   createImageData() {
      return this.ctx.createImageData(this.canvas.width, this.canvas.height);
   }
}
