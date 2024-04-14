import { int } from 'utils/math.js';
import { averageColorComponent } from 'utils/image.js';
import { HittableList } from 'classes/Scene.js';
import { Camera as RCamera } from 'classes/Camera.js';
import { Sphere } from 'classes/Object.js';
import { Lambertian, Metal, Dielectric } from 'classes/Material.js';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 256;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);
// const I_HEIGHT = 256;

const RENDER_CYCLES = 1;

let cycles = RENDER_CYCLES;
let prevFramebuffer = null;
let nextFramebuffer = null;

function setup() {
   createCanvas(I_WIDTH, I_HEIGHT, WEBGL);
   prevFramebuffer = createFramebuffer();
   nextFramebuffer = createFramebuffer();
   prevFramebuffer.loadPixels();
   nextFramebuffer.loadPixels();
}

function draw() {
   const start = millis();

   // [nextFramebuffer, prevFramebuffer] = [prevFramebuffer, nextFramebuffer];

   const Scene = new HittableList();
   const floorMat = new Lambertian(createVector(0.8, 0.8, 0.0));
   const glassMat = new Dielectric(1.5);
   const bubbleMat = new Dielectric(1 / 1.5);
   const steelMat = new Metal(createVector(0.8, 0.8, 0.8));
   const bronzeMat = new Metal(createVector(0.8, 0.6, 0.2), 0.6);

   Scene.add(new Sphere(createVector(0, -100.5, -1), 100, floorMat));
   Scene.add(new Sphere(createVector(0, 0, -1.2), 0.5, bronzeMat));
   Scene.add(new Sphere(createVector(-1, 0, -1), 0.5, glassMat));
   Scene.add(new Sphere(createVector(-1, 0, -1), 0.4, bubbleMat));
   Scene.add(new Sphere(createVector(1, 0, -1), 0.5, steelMat));

   const Camera = new RCamera(I_WIDTH, I_HEIGHT, Scene);
   Camera.lookFrom = createVector(-2, 2, 1);
   Camera.spp = 50;
   Camera.vFov = 20;

   Camera.render(prevFramebuffer);
   prevFramebuffer.updatePixels();

   // const pixels = nextFramebuffer.pixels;
   // for (let i = 0; i < pixels.length; i += 4) {
   //    pixels[i] = averageColorComponent(pixels[i], prevFramebuffer.pixels[i]);
   //    pixels[i + 1] = averageColorComponent(pixels[i + 1], prevFramebuffer.pixels[i + 1]);
   //    pixels[i + 2] = averageColorComponent(pixels[i + 2], prevFramebuffer.pixels[i + 2]);
   //    pixels[i + 3] = 255;
   // }
   // nextFramebuffer.updatePixels();

   translate(-I_WIDTH / 2, -I_HEIGHT / 2, 0);
   // image(nextFramebuffer, 0, 0, I_WIDTH, I_HEIGHT);
   image(prevFramebuffer, 0, 0, I_WIDTH, I_HEIGHT);

   let end = millis();
   const elapsed = end - start;
   console.warn('This took: ' + elapsed.toFixed(2) + 'ms.');

   cycles--;
   if (cycles <= 0) noLoop();
}

window.setup = setup;
window.draw = draw;
