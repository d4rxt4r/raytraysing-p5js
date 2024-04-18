import Renderer from '../classes/Renderer.js';

function calculateZoom(canvasWidth) {
   return Math.min(window.innerWidth / canvasWidth, 10);
}

function createCanvas(width = 100, height = 100, parentEl = document.body) {
   if (window.__canvas) {
      throw new Error('Canvas already exists!');
   }

   const canvas = document.createElement('canvas');

   canvas.width = width;
   canvas.height = height;

   canvas.style.zoom = calculateZoom(canvas.width);
   window.addEventListener('resize', () => {
      canvas.style.zoom = calculateZoom(canvas.width);
   });

   parentEl.appendChild(canvas);
   window.__canvas = new Renderer(canvas);

   return window.__canvas;
}

export { createCanvas, calculateZoom };
