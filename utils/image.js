import { Interval } from 'utils/math.js';

function getPixelIndex(x, y, w) {
   return (y * w + x) * 4;
}

function averageColorComponent(a, b) {
   return (a + b) / 2;
}

function averageColors(color1, color2) {
   return createVector(
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

export { getPixelIndex, setImagePixel, averageColorComponent, averageColors };
