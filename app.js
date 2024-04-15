import { int, randomDouble } from 'utils/math.js';
import { vec3, Vector } from 'utils/vector.js';
import { averageColorComponent, randomColor } from 'utils/image.js';
import { HittableList } from 'classes/Scene.js';
import { BHVNode, Sphere } from 'classes/Object.js';
import { FlatColor, Metal, Dielectric } from 'classes/Material.js';
import PCamera from 'classes/Camera.js';

const { sub } = Vector;

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 256;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);
// const I_HEIGHT = 256;

const RENDER_CYCLES = 1;

let Scene;
let Camera;
let cycles = 0;

function setupTestScene(scene, camera) {
   scene.add(new Sphere(vec3(0, -50.5, 0), 50, new FlatColor(vec3(0.8, 0.8, 0.0))));
   scene.add(new Sphere(vec3(0, 0, 0), 0.5, new Metal(vec3(0.8, 0.6, 0.2), 0.5)));
   scene.add(new Sphere(vec3(0.7, 0, -1), 0.5, new Dielectric(1.5)));
   scene.add(new Sphere(vec3(0.7, 0, -1), 0.4, new Dielectric(1 / 1.5)));
   scene.add(new Sphere(vec3(-1.2, 0, 0.2), 0.5, new Metal(vec3(0.8, 0.8, 0.8))));

   const world = new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));

   camera.lookFrom = vec3(0, 2, -6);
   camera.lookAt = vec3(0, 0, 0);
   camera.spp = 50;
   camera.vFov = 25;
   camera.defocusAngle = 2;
   camera.focusDist = 5;
   camera.maxDepth = 15;
   camera.scene = world;
   camera.init();

   return world;
}

function setupDemoScene(scene, camera) {
   scene.add(new Sphere(vec3(0, -1000, 0), 1000, new FlatColor(vec3(0.5, 0.5, 0.5))));

   for (let a = -11; a < 11; a++) {
      for (let b = -11; b < 11; b++) {
         const choose_mat = Math.random();
         const center = vec3(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());
         if (sub(center, vec3(4, 0.2, 0)).mag() > 0.9) {
            if (choose_mat < 0.8) {
               // diffuse
               const albedo = randomColor();
               scene.add(new Sphere(center, 0.2, new FlatColor(albedo)));
            } else if (choose_mat < 0.95) {
               // metal
               const albedo = randomColor(0.5, 1);
               const fuzz = randomDouble(0, 0.5);
               scene.add(new Sphere(center, 0.2, new Metal(albedo, fuzz)));
            } else {
               // glass
               scene.add(new Sphere(center, 0.2, new Dielectric(1.5)));
            }
         }
      }
   }

   scene.add(new Sphere(vec3(0, 1, 0), 1.0, new Dielectric(1.5)));
   scene.add(new Sphere(vec3(-4, 1, 0), 1.0, new FlatColor(vec3(0.4, 0.2, 0.1))));
   scene.add(new Sphere(vec3(4, 1, 0), 1.0, new Metal(vec3(0.7, 0.6, 0.5))));

   const world = new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));

   camera.spp = 20;
   camera.maxDepth = 10;
   camera.scene = world;
   camera.vFov = 20;
   camera.lookFrom = vec3(13, 2, 3);
   camera.lookAt = vec3(0, 0, 0);
   camera.defocusAngle = 0.6;
   camera.focusDist = 10;

   camera.init();

   return world;
}

function setup() {
   pixelDensity(1);
   createCanvas(I_WIDTH, I_HEIGHT, WEBGL);
   loadPixels();

   Camera = new PCamera(I_WIDTH, I_HEIGHT);
   Scene = setupTestScene(new HittableList(), Camera);
   // Scene = setupDemoScene(new HittableList(), Camera);
}

let prev;
function draw() {
   performance.mark('testStart');

   // prev = Uint8ClampedArray.from(pixels);
   Camera.render(pixels);

   // for (let i = 0; i < prev.length; i += 4) {
   //    if (prev[i] + prev[i + 1] + prev[i + 2] === 0) {
   //       continue;
   //    }

   //    if (pixels[i] + pixels[i + 1] + pixels[i + 2] === 0) {
   //       pixels[i] = prev[i];
   //       pixels[i + 1] = prev[i + 1];
   //       pixels[i + 2] = prev[i + 2];
   //    } else {
   //       pixels[i] = averageColorComponent(pixels[i], prev[i]);
   //       pixels[i + 1] = averageColorComponent(pixels[i + 1], prev[i + 1]);
   //       pixels[i + 2] = averageColorComponent(pixels[i + 2], prev[i + 2]);
   //    }
   // }

   updatePixels();

   performance.mark('testEnd');
   performance.measure('draw', 'testStart', 'testEnd');
   console.warn('Generation took: ' + performance.getEntriesByName('draw')[0].duration.toFixed(2) + 'ms');

   cycles++;
   if (cycles >= RENDER_CYCLES) {
      noLoop();
   }
}

window.setup = setup;
window.draw = draw;
