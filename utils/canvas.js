class Renderer {
   constructor(canvas) {
      if (!canvas) {
         throw new Error('Canvas not provided!');
      }

      this._initContext(canvas);
      this._initOffscreenContext();
   }

   _initContext(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
   }

   _initOffscreenContext() {
      this.offCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);
      this.offCtx = this.offCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
   }

   render() {
      this.ctx.putImageData(this.offCtx.getImageData(0, 0, this.canvas.width, this.canvas.height), 0, 0);
   }

   fill(clr) {
      this.offCtx.fillStyle = clr;
   }

   rect(x, y, w, h) {
      this.offCtx.fillRect(x, y, w, h);
   }

   putImageData(imageData, x = 0, y = 0) {
      this.offCtx.putImageData(imageData, x, y);
   }

   createImageData(imageData) {
      if (imageData instanceof ImageData) {
         return this.offCtx.createImageData(imageData);
      }
      return this.offCtx.createImageData(this.canvas.width, this.canvas.height);
   }
}

function createCanvas(width = 100, height = 100, parentEl = document.body) {
   const canvas = document.createElement('canvas');

   canvas.width = width;
   canvas.height = height;

   parentEl.appendChild(canvas);

   return new Renderer(canvas);
}

export { createCanvas };
