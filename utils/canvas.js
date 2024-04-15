class Renderer {
   constructor(canvas) {
      if (!canvas) {
         throw new Error('Canvas not provided!');
      }

      this._currentSplit = 0;
      this._splitNum = 64;
      this._cols = Math.ceil(Math.sqrt(this._splitNum));
      this._rows = Math.ceil(this._splitNum / this._cols);

      this._chunkWidth = Math.ceil(canvas.width / this._cols);
      this._chunkHeight = Math.ceil(canvas.height / this._rows);

      this.t0;

      this._initContext(canvas);
      this._initImageData();
   }

   get pixels() {
      return this.imageData.data;
   }

   get chunkCoords() {
      return {
         x: this._currentSplit % this._cols,
         y: Math.floor(this._currentSplit / this._cols)
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

   _initImageData() {
      this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
   }

   render(callback) {
      if (this._currentSplit === this._splitNum) {
         this._currentSplit = 0;
         console.info('ℹ️ Generation took: ' + (performance.now() - this.t0).toFixed(2) + 'ms');
         return;
      }

      if (this._currentSplit === 0) {
         this.t0 = performance.now();
      }

      callback();
      this.ctx.putImageData(this.imageData, 0, 0);
      this._currentSplit++;

      requestAnimationFrame(() => {
         this.render(callback);
      });
   }

   createImageData() {
      return this.ctx.createImageData(this.canvas.width, this.canvas.height);
   }
}

function calculateZoom(canvas) {
   return (window.innerWidth - window.innerWidth / 3) / canvas.width;
}

function createCanvas(width = 100, height = 100, parentEl = document.body) {
   if (window.__canvas) {
      throw new Error('Canvas already exists!');
   }

   const canvas = document.createElement('canvas');

   canvas.width = width;
   canvas.height = height;

   canvas.style.zoom = calculateZoom(canvas);
   window.addEventListener('resize', () => {
      canvas.style.zoom = calculateZoom(canvas);
   });

   parentEl.appendChild(canvas);
   window.__canvas = new Renderer(canvas);

   return window.__canvas;
}

export { createCanvas };
