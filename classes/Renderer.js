import { setImagePixel } from '../utils/image.js';
import { calculateZoom } from '../utils/canvas.js';

export default class Renderer {
   constructor(canvas) {
      if (!canvas) {
         throw new Error('Canvas not provided!');
      }
      this._imageWidth = canvas.width;
      this._imageHeight = canvas.height;

      this._threads = navigator.hardwareConcurrency || 4;
      this._workers = [];

      const chunks = this._threads * 4;
      this._chunkCols = Math.floor(Math.sqrt(chunks));
      this._chunkRows = Math.ceil(chunks / this._chunkCols);
      this._chunks = this._chunkCols * this._chunkRows;

      this._chunkWidth = Math.floor(canvas.width / this._chunkCols);
      this._chunkHeight = Math.floor(canvas.height / this._chunkRows);

      this._t0;

      this.scene;

      this._initContext(canvas);
      this._initRenderWorkers();
      this._initImageData();
   }

   resizeCanvas(w, h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.style.zoom = calculateZoom(w);

      this._imageWidth = w;
      this._imageHeight = h;

      this._chunkWidth = Math.floor(this.canvas.width / this._chunkCols);
      this._chunkHeight = Math.floor(this.canvas.height / this._chunkRows);

      this._initImageData();
   }

   setScene(scene) {
      this._scene = scene;

      this._workers.forEach((worker) => {
         worker.postMessage({
            action: 'initScene',
            scene: scene,
            camera: {
               imageWidth: this._imageWidth,
               imageHeight: this._imageHeight
            }
         });
      });
   }

   get pixels() {
      return this.imageData.data;
   }

   getChunkCoords(chunkIndex) {
      return {
         x: chunkIndex % this._chunkCols,
         y: Math.floor(chunkIndex / this._chunkCols)
      };
   }

   getChunkInterval(chunkIndex) {
      const { x, y } = this.getChunkCoords(chunkIndex);
      return {
         startX: x * this._chunkWidth,
         startY: y * this._chunkHeight,
         endX: x * this._chunkWidth + this._chunkWidth - 1,
         endY: y * this._chunkHeight + this._chunkHeight - 1
      };
   }

   _initContext(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { willReadFrequently: true });
   }

   _initRenderWorkers() {
      for (let i = 0; i < this._threads; i++) {
         const worker = new Worker('render.worker.js', { type: 'module' });
         worker.onmessage = (e) => {
            const { x, y, startX, startY, endX, endY, color } = e.data;

            setImagePixel(this.pixels, x, y, this.canvas.width, color);
            this.ctx.putImageData(this.imageData, 0, 0);

            if (x === this._imageWidth - 1 && y === this._imageHeight - 1) {
               console.info('ℹ️ Generation took: ' + (performance.now() - this._t0).toFixed(2) + 'ms');
            }

            if (y === endY && x === endX) {
               return;
            }

            worker.postMessage({
               action: 'render',
               data: {
                  x: x === endX ? startX : x + 1,
                  y: x === endX ? y + 1 : y,
                  startX,
                  startY,
                  endX,
                  endY
               }
            });
         };

         this._workers.push(worker);
      }
   }

   _initImageData() {
      this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
   }

   render() {
      this._t0 = performance.now();

      for (let chunkIndex = 0; chunkIndex < this._chunks; chunkIndex++) {
         const {
            startX = 0,
            startY = 0,
            endX = this._imageWidth,
            endY = this._imageHeight
         } = this.getChunkInterval(chunkIndex);

         this._workers[chunkIndex % this._threads].postMessage({
            action: 'render',
            data: {
               x: startX,
               y: startY,
               startX,
               startY,
               endX,
               endY
            }
         });
      }
   }

   createImageData() {
      return this.ctx.createImageData(this.canvas.width, this.canvas.height);
   }
}
