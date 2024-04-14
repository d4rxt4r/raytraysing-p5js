import { int } from 'utils/math.js';
import { vec3 } from 'utils/vector.js';
import { averageColorComponent } from 'utils/image.js';
import { HittableList } from 'classes/Scene.js';
import { Camera as RCamera } from 'classes/Camera.js';
import { Sphere } from 'classes/Object.js';
import { Lambertian as FlatColor, Metal, Dielectric } from 'classes/Material.js';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 256;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);
// const I_HEIGHT = 256;

const RENDER_CYCLES = 10;

let Camera;
let buffer;
let cycles = 0;

function setup() {
   createCanvas(I_WIDTH, I_HEIGHT, WEBGL);
   loadPixels();

   buffer = createGraphics(I_WIDTH, I_HEIGHT, WEBGL);
   buffer.loadPixels();

   const Scene = new HittableList();
   const FLOOR_MAT = new FlatColor(vec3(0.8, 0.8, 0.0));
   const GLASS_MAT = new Dielectric(1.5);
   const INSIDE_GLASS_MAT = new Dielectric(1 / 1.5);
   const STEEL_MAT = new Metal(vec3(0.8, 0.8, 0.8));
   const BRONZE_MAT = new Metal(vec3(0.8, 0.6, 0.2), 0.6);

   Scene.add(new Sphere(vec3(0, -100.5, -1), 100, FLOOR_MAT));
   Scene.add(new Sphere(vec3(0, 0, -1.2), 0.5, BRONZE_MAT));
   Scene.add(new Sphere(vec3(-1, 0, -1), 0.5, GLASS_MAT));
   Scene.add(new Sphere(vec3(-1, 0, -1), 0.4, INSIDE_GLASS_MAT));
   Scene.add(new Sphere(vec3(1, 0, -1), 0.5, STEEL_MAT));

   Camera = new RCamera(I_WIDTH, I_HEIGHT, Scene);
   Camera.lookFrom = vec3(-1.5, 2, 2);
   Camera.spp = 30;
   Camera.vFov = 25;
   Camera.maxDepth = 30;
   Camera.init();
}

let prev;
function draw() {
   const start = millis();

   prev = Uint8ClampedArray.from(pixels);
   Camera.render(pixels);

   for (let i = 0; i < prev.length; i += 4) {
      if (prev[i] + prev[i + 1] + prev[i + 2] === 0) {
         continue;
      }

      if (pixels[i] + pixels[i + 1] + pixels[i + 2] === 0) {
         pixels[i] = prev[i];
         pixels[i + 1] = prev[i + 1];
         pixels[i + 2] = prev[i + 2];
      } else {
         pixels[i] = averageColorComponent(pixels[i], prev[i]);
         pixels[i + 1] = averageColorComponent(pixels[i + 1], prev[i + 1]);
         pixels[i + 2] = averageColorComponent(pixels[i + 2], prev[i + 2]);
      }
   }

   updatePixels();

   let end = millis();
   const elapsed = end - start;
   console.warn('This took: ' + elapsed.toFixed(2) + 'ms.');

   cycles++;
   if (cycles >= RENDER_CYCLES) {
      noLoop();
   }
}

window.setup = setup;
window.draw = draw;
