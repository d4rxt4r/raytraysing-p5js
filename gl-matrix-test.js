import { int } from 'utils/math.js';
import { getPixelIndex, setImagePixel } from 'utils/image.js';
import { default as Ray } from 'classes/Ray.js';

const { vec3 } = glMatrix;

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 600;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);

const V_HEIGHT = 2.0;
const V_WIDTH = V_HEIGHT * (I_WIDTH / I_HEIGHT);

const FOCAL_LENGTH = 1.0;

function unitVector(vec) {
   return p5.Vector.div(vec, vec.mag());
}

function getRayColor(r) {
   const unitDirection = vec3.create();
   vec3.normalize(unitDirection, r.direction);
   const a = 0.5 * (unitDirection[1] + 1.0);

   // return [(1.0 - a) * 1 + a * 0.5, (1.0 - a) * 1 + a * 0.7, (1.0 - a) * 1 + a * 1.0];
   return [255 * unitDirection[1], 0, 0];
}

function setup() {
   createCanvas(I_WIDTH, I_HEIGHT, WEBGL);
}

function draw() {
   const start = millis();

   const focalVec = vec3.fromValues(0, 0, FOCAL_LENGTH);
   const cameraCenter = vec3.fromValues(0, 0, 0);
   const viewportU = vec3.fromValues(V_WIDTH, 0, 0);
   const viewportV = vec3.fromValues(0, -V_HEIGHT, 0);

   const pixelDeltaU = vec3.create();
   const pixelDeltaV = vec3.create();
   vec3.scale(pixelDeltaU, viewportU, 1 / I_WIDTH);
   vec3.scale(pixelDeltaV, viewportV, 1 / I_HEIGHT);

   const viewportUC = vec3.create();
   const viewportVC = vec3.create();
   vec3.copy(viewportUC, viewportU);
   vec3.scale(viewportUC, viewportUC, 0.5);
   vec3.copy(viewportVC, viewportV);
   vec3.scale(viewportVC, viewportVC, 0.5);

   const viewportUpperL = vec3.create();
   vec3.sub(viewportUpperL, cameraCenter, focalVec);
   vec3.sub(viewportUpperL, viewportUpperL, viewportUC);
   vec3.sub(viewportUpperL, viewportUpperL, viewportVC);

   const pixel00Loc = vec3.create();
   vec3.mul(
      pixel00Loc,
      vec3.add(vec3.create(), viewportUpperL, vec3.fromValues(0.5, 0.5, 0.5)),
      vec3.add(vec3.create(), pixelDeltaU, pixelDeltaV)
   );

   loadPixels();
   let index;
   for (let j = 0; j < I_HEIGHT; j++) {
      for (let i = 0; i < I_WIDTH; i++) {
         index = getPixelIndex(i, j, I_WIDTH);
         const pixelCenter = vec3.create();
         vec3.add(pixelCenter, pixel00Loc, vec3.scale(vec3.create(), pixelDeltaU, i));
         vec3.add(pixelCenter, pixelCenter, vec3.scale(vec3.create(), pixelDeltaV, j));

         const rayDirection = vec3.create();
         vec3.sub(rayDirection, pixelCenter, cameraCenter);

         const r = new Ray(cameraCenter, rayDirection);
         const pixel_color = getRayColor(r).map((x) => int(x * 255));

         setImagePixel(i, j, I_WIDTH, pixel_color);
      }
   }
   updatePixels();

   noLoop();

   let end = millis();
   const elapsed = end - start;
   console.warn('This took: ' + elapsed.toFixed(2) + 'ms.');
}

window.setup = setup;
window.draw = draw;
