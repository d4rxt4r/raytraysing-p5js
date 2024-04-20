import { int } from '../utils/math.js';
import { setImagePixel, getHeight } from '../utils/image.js';
import { calculateZoom } from '../utils/canvas.js';

export default class Renderer {
   #imageWidth;
   #imageHeight;
   #threads;
   #workers = [];
   #chunkCols;
   #chunkRows;
   #currentChunk = 0;
   #chunks;
   #chunkWidth;
   #chunkHeight;
   #canvas;
   #ctx;
   #imageData;
   // _t0;

   constructor(canvas) {
      if (!canvas) {
         throw new Error('Canvas not provided!');
      }

      this.#threads = navigator.hardwareConcurrency || 4;
      this.#chunkCols = Math.floor(Math.sqrt(this.#threads * 4));
      this.#chunkRows = Math.floor((this.#threads * 4) / this.#chunkCols);
      this.#chunks = this.#chunkCols * this.#chunkRows;
      this.#chunkWidth = Math.ceil(canvas.width / this.#chunkCols);
      this.#chunkHeight = Math.ceil(canvas.height / this.#chunkRows);
      this.#imageWidth = this.#chunkWidth * this.#chunkCols;
      this.#imageHeight = this.#chunkHeight * this.#chunkRows;

      this.#canvas = canvas;
      this.#ctx = canvas.getContext('2d', { willReadFrequently: true });

      this.#initRenderWorkers();
      this.#initImageData();
   }

   get pixels() {
      return this.#imageData.data;
   }

   resizeCanvas(w, h) {
      this.#chunkWidth = Math.ceil(w / this.#chunkCols);
      this.#chunkHeight = Math.ceil(h / this.#chunkRows);
      this.#imageWidth = this.#chunkWidth * this.#chunkCols;
      this.#imageHeight = this.#chunkHeight * this.#chunkRows;
      this.#canvas.width = this.#imageWidth;
      this.#canvas.height = this.#imageHeight;
      this.#canvas.style.zoom = calculateZoom(this.#imageWidth);

      this.setCameraSettings({ imageWidth: this.#imageWidth, imageHeight: this.#imageHeight });
      this.#initImageData();
   }

   setResolution(scale) {
      this.resizeCanvas(int(window.innerHeight * scale), getHeight(window.innerHeight * scale));
   }

   setScene(scene) {
      this.#workers.forEach((worker) => {
         worker.postMessage({
            action: 'initScene',
            scene: scene
         });
      });
   }

   setTextures(textures) {
      this.#workers.forEach((worker) => {
         worker.postMessage({
            action: 'setTextures',
            textures: textures
         });
      });
   }

   moveCamera(axis, val, pos = false) {
      this.#workers.forEach((worker) => {
         worker.postMessage({
            action: 'moveCamera',
            data: {
               axis,
               val,
               pos
            }
         });
      });

      this.render();
   }

   setCameraSettings(settings) {
      this.#workers.forEach((worker) => {
         worker.postMessage({
            action: 'settings',
            settings
         });
      });
   }

   restoreCameraSettings() {
      this.#workers.forEach((worker) => {
         worker.postMessage({
            action: 'restoreCamera'
         });
      });

      this.render();
   }

   #getChunkCoords(chunkIndex) {
      return {
         x: chunkIndex % this.#chunkCols,
         y: Math.floor(chunkIndex / this.#chunkCols)
      };
   }

   #getChunk(chunkIndex) {
      const { x, y } = this.#getChunkCoords(chunkIndex);
      return {
         startX: x * this.#chunkWidth,
         startY: y * this.#chunkHeight,
         endX: x * this.#chunkWidth + this.#chunkWidth - 1,
         endY: y * this.#chunkHeight + this.#chunkHeight - 1
      };
   }

   #initRenderWorkers() {
      for (let i = 0; i < this.#threads; i++) {
         const worker = new Worker('render.worker.js', { type: 'module' });
         worker.onmessage = this.#onMessageHandler.bind(this, worker);
         this.#workers.push(worker);
      }
   }

   #initImageData() {
      this.#imageData = this.#ctx.createImageData(this.#canvas.width, this.#canvas.height);
   }

   #onMessageHandler(worker, msg) {
      const { x, y, startX, startY, endX, endY, color } = msg.data;
      setImagePixel(this.pixels, x, y, this.#canvas.width, color);
      this.#ctx.putImageData(this.#imageData, 0, 0);

      if (y === endY && x === endX) {
         return this.#renderChunk(worker);
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
   }

   #renderChunk(worker) {
      if (this.#currentChunk === this.#chunks) {
         return;
      }

      const {
         startX = 0,
         startY = 0,
         endX = this.#imageWidth,
         endY = this.#imageHeight
      } = this.#getChunk(this.#currentChunk);

      worker.postMessage({
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

      this.#currentChunk += 1;
   }

   render() {
      // this._t0 = performance.now();
      // if (x === this._imageWidth && y === this._imageHeight) {
      //    console.info('ℹ️ Generation took: ' + (performance.now() - this._t0).toFixed(2) + 'ms');
      // }

      this.resizeCanvas(this.#imageWidth, this.#imageHeight);
      this.#currentChunk = 0;

      for (let i = 0; i < this.#threads; i++) {
         this.#renderChunk(this.#workers[i]);
      }
   }
}
