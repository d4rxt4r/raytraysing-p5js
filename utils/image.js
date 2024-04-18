import { vec3, randVec3 } from './vector.js';
import { int } from './math.js';
import Interval from '../classes/Interval.js';

const FULL_RES = 1200;
const LOW_RES = 128;
const ASPECT_RATIO = 16 / 9;

function getHeight(w) {
   const height = int(w / ASPECT_RATIO);
   return height || 1;
}

class UserImage {
   constructor(imageData) {
      this._imageData = imageData;
   }

   get width() {
      return this._imageData.width;
   }

   get height() {
      return this._imageData.height;
   }

   get pixels() {
      return this._imageData.data;
   }

   static async load(path, ctx) {
      return new Promise((resolve) => {
         const image = new Image();
         image.onload = () => {
            ctx.canvas.width = image.width;
            ctx.canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            resolve(new UserImage(ctx.getImageData(0, 0, image.width, image.height)));
         };

         image.src = path;
      });
   }
}

const TEX_PATHS = ['earthmap.jpg'];
const LOADED_TEX = [];

async function preloadTextures() {
   const canvas = new OffscreenCanvas(1, 1);
   const ctx = canvas.getContext('2d');

   for (const path of TEX_PATHS) {
      LOADED_TEX.push(await UserImage.load(path, ctx));
   }

   return LOADED_TEX;
}

function isTexturesLoaded() {
   return TEX_PATHS.length === LOADED_TEX.length;
}

function getPixelIndex(x, y, w) {
   return (y * w + x) * 4;
}

function averageColorComponent(a, b) {
   return (a + b) / 2;
}

function averageColors(color1, color2) {
   return vec3(
      averageColorComponent(color1.x, color2.x),
      averageColorComponent(color1.y, color2.y),
      averageColorComponent(color1.z, color2.z)
   );
}
function linearToGamma(component) {
   if (component > 0) {
      return Math.sqrt(component);
   }

   return 0;
}

function randomColor(min, max) {
   const randVec = randVec3(min, max);
   return vec3(Math.abs(randVec.x), Math.abs(randVec.y), Math.abs(randVec.z));
}

function setImagePixel(imgPixels, x, y, w, color) {
   const index = getPixelIndex(x, y, w);
   const intensity = new Interval(0, 0.999);

   const r = linearToGamma(color.x);
   const g = linearToGamma(color.y);
   const b = linearToGamma(color.z);

   imgPixels[index] = 255 * intensity.clamp(r);
   imgPixels[index + 1] = 255 * intensity.clamp(g);
   imgPixels[index + 2] = 255 * intensity.clamp(b);
   imgPixels[index + 3] = 255;
}

export {
   LOADED_TEX,
   FULL_RES,
   LOW_RES,
   UserImage,
   getHeight,
   preloadTextures,
   isTexturesLoaded,
   getPixelIndex,
   setImagePixel,
   averageColorComponent,
   averageColors,
   randomColor
};
