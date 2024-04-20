import { setImagePixel, FULL_RES, getHeight } from '../utils/image.js';
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

   constructor(canvas) {
      if (!canvas) {
         throw new Error('Canvas not provided!');
      }

      this.#imageWidth = canvas.width;
      this.#imageHeight = canvas.height;

      this.#threads = navigator.hardwareConcurrency || 4;

      const chunks = this.#threads * 4;
      this.#chunkCols = Math.floor(Math.sqrt(chunks));
      this.#chunkRows = Math.ceil(chunks / this.#chunkCols);
      this.#chunks = this.#chunkCols * this.#chunkRows;

      this.#chunkWidth = Math.floor(canvas.width / this.#chunkCols);
      this.#chunkHeight = Math.floor(canvas.height / this.#chunkRows);

      // this._t0;
      // this._scene;

      this.#initContext(canvas);
      this.#initRenderWorkers();
      this.#initImageData();
   }

   get pixels() {
      return this.#imageData.data;
   }

   resizeCanvas(w, h) {
      this.setCameraSettings({ imageWidth: w, imageHeight: h });
      this.#canvas.width = w;
      this.#canvas.height = h;
      this.#canvas.style.zoom = calculateZoom(w);

      this.#imageWidth = w;
      this.#imageHeight = h;

      this.#chunkWidth = Math.floor(this.#canvas.width / this.#chunkCols);
      this.#chunkHeight = Math.floor(this.#canvas.height / this.#chunkRows);

      this.#initImageData();
   }

   setResolution(scale) {
      this.resizeCanvas(FULL_RES * scale, getHeight(FULL_RES) * scale);
   }

   setCameraSettings(settings) {
      this.#workers.forEach((worker) => {
         worker.postMessage({
            action: 'settings',
            settings
         });
      });
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

   #initContext(canvas) {
      this.#canvas = canvas;
      this.#ctx = canvas.getContext('2d', { willReadFrequently: true });
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
         if (this.#currentChunk === this.#chunks) {
            return;
         }

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
