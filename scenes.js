import { Vector, vec3 } from './utils/vector.js';
import { randomDouble } from './utils/math.js';
import { randomColor, LOADED_TEX } from './utils/image.js';
import { HittableList } from './classes/Scene.js';
import { BHVNode, Sphere, Quad, Box } from './classes/Objects.js';
import { Diffuse, Metal, Dielectric, DiffusedLight } from './classes/Materials.js';
import { CheckerBoard, ImageTexture, NoiseTexture } from './classes/Texture.js';
import { alea } from './lib/alea.min.js';

const { sub } = Vector;

function TestScene() {
   const scene = new HittableList();

   scene.add(new Sphere(vec3(0, -100.5, 0), 100, new Diffuse(vec3(0.1, 0.3, 0.1))));
   const checker = new CheckerBoard(0.07, vec3(0.2, 0.3, 0.1), vec3(0.9, 0.9, 0.9));
   scene.add(new Sphere(vec3(0, 0, 0), 0.5, new Diffuse(checker)));
   scene.add(new Sphere(vec3(0.7, 0, -1), 0.4, new Dielectric(1.5)));
   scene.add(new Sphere(vec3(0.7, 0, -1), 0.3, new Dielectric(1 / 1.5)));
   scene.add(new Sphere(vec3(-0.8, -0.15, -0.5), 0.3, new Metal(vec3(0.8, 0.8, 0.8))));

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

const TestSceneCamera = {
   lookFrom: vec3(0, 2, -8),
   lookAt: vec3(0, -0.1, 0),
   spp: 20,
   maxDepth: 50,
   vFov: 12,
   defocusAngle: 1,
   focusDist: 8,
   background: vec3(0.7, 0.8, 1)
};

function DemoScene(camera) {
   // Use alea alg to e nsure that Math.random gives same output across all workers
   Math.random = alea;

   const scene = new HittableList();
   scene.add(new Sphere(vec3(0, -1000, 0), 1000, new Diffuse(vec3(0.5, 0.5, 0.5))));

   for (let a = -11; a < 11; a++) {
      for (let b = -11; b < 11; b++) {
         const choose_mat = Math.random();
         const center = vec3(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());
         if (sub(center, vec3(4, 0.2, 0)).mag() > 0.9) {
            if (choose_mat < 0.8) {
               // diffuse
               const albedo = randomColor();
               scene.add(new Sphere(center, 0.2, new Diffuse(albedo)));
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
   scene.add(new Sphere(vec3(-4, 1, 0), 1.0, new Diffuse(vec3(0.4, 0.2, 0.1))));
   scene.add(new Sphere(vec3(4, 1, 0), 1.0, new Metal(vec3(0.7, 0.6, 0.5))));

   const world = new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));

   if (camera) {
      camera.spp = 20;
      camera.maxDepth = 10;
      camera.vFov = 20;
      camera.lookFrom = vec3(13, 2, 3);
      camera.lookAt = vec3(0, 0, 0);
      camera.defocusAngle = 0.6;
      camera.focusDist = 10;

      camera.init();
   }

   return world;
}

const DemoSceneCamera = {
   spp: 20,
   maxDepth: 10,
   vFov: 20,
   lookFrom: vec3(13, 2, 3),
   lookAt: vec3(0, 0, 0),
   defocusAngle: 0.6,
   focusDist: 10
};

function QuadsScene() {
   const scene = new HittableList();

   scene.add(new Quad(vec3(-3, -2, 5), vec3(0, 0, -4), vec3(0, 4, 0), new Diffuse(vec3(1.0, 0.2, 0.2))));
   scene.add(new Quad(vec3(-2, -2, 0), vec3(4, 0, 0), vec3(0, 4, 0), new Diffuse(vec3(0.2, 1.0, 0.2))));
   scene.add(new Quad(vec3(3, -2, 1), vec3(0, 0, 4), vec3(0, 4, 0), new Diffuse(vec3(0.2, 0.2, 1.0))));
   scene.add(new Quad(vec3(-2, 3, 1), vec3(4, 0, 0), vec3(0, 0, 4), new Diffuse(vec3(1.0, 0.5, 0.0))));
   scene.add(new Quad(vec3(-2, -3, 5), vec3(4, 0, 0), vec3(0, 0, -4), new Diffuse(vec3(0.2, 0.8, 0.8))));

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

const QuadsSceneCamera = {
   spp: 100,
   maxDepth: 50,
   vFov: 80,
   lookFrom: vec3(0, 0, 9),
   lookAt: vec3(0, 0, 0),
   vUp: vec3(0, 1, 0),
   defocusAngle: 0
};

function DarkScene() {
   const scene = new HittableList();

   scene.add(
      new Quad(
         vec3(-25, 0, 25),
         vec3(0, 0, -50),
         vec3(50, 0, 0),
         new Diffuse(new CheckerBoard(0.05, vec3(0.2, 0.3, 0.1), vec3(0.9, 0.9, 0.9)))
      )
   );
   scene.add(new Sphere(vec3(0, 1.5, 0), 1.5, new Metal(vec3(0.8, 0.8, 0.8), 0.1)));
   scene.add(new Quad(vec3(-3, 0, -3), vec3(3, 0, 0), vec3(0, 3, 0), new DiffusedLight(vec3(7, 8, 10))));

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

const DarkSceneCamera = {
   lookFrom: vec3(26, 3, 6),
   lookAt: vec3(0, 2, 0),
   spp: 1000,
   maxDepth: 200,
   vFov: 15,
   defocusAngle: 0,
   focusDist: 6,
   background: vec3(0, 0, 0)
};

function EarthScene() {
   const scene = new HittableList();

   scene.add(new Sphere(vec3(0, 0, 0), 2, new Diffuse(new ImageTexture(LOADED_TEX[0]))));

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

const EarthSceneCamera = {
   spp: 100,
   maxDepth: 50,
   vFov: 20,
   lookFrom: vec3(0, 0, 12),
   lookAt: vec3(0, 0, 0),
   vUp: vec3(0, 1, 0),
   defocusAngle: 0,

}

function PerlinScene() {
   // Use alea alg to e nsure that Math.random gives same output across all workers
   Math.random = alea;

   const scene = new HittableList();
   const noiseTex = new NoiseTexture(4);
   scene.add(new Sphere(vec3(0, -1000, 0), 1000, new Diffuse(noiseTex)));
   scene.add(new Sphere(vec3(0, 2, 0), 2, new Diffuse(noiseTex)));

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

const PerlinScenCamera = {
   spp: 100,
   maxDepth: 50,
   vFov: 25,
   lookFrom: vec3(13, 2, 3),
   lookAt: vec3(0, 0, 0),
   vUp: vec3(0, 1, 0),
   defocusAngle: 0
}

function CornellBox() {
   const scene = new HittableList();

   const red = new Diffuse(vec3(0.65, 0.05, 0.05));
   const white = new Diffuse(vec3(0.73, 0.73, 0.73));
   const green = new Diffuse(vec3(0.12, 0.45, 0.15));
   const light = new DiffusedLight(vec3(15, 15, 15));

   scene.add(new Quad(vec3(555, 0, 0), vec3(0, 555, 0), vec3(0, 0, 555), green));
   scene.add(new Quad(vec3(0, 0, 0), vec3(0, 555, 0), vec3(0, 0, 555), red));
   scene.add(new Quad(vec3(343, 554, 332), vec3(-130, 0, 0), vec3(0, 0, -105), light));
   scene.add(new Quad(vec3(0, 0, 0), vec3(555, 0, 0), vec3(0, 0, 555), white));
   scene.add(new Quad(vec3(555, 555, 555), vec3(-555, 0, 0), vec3(0, 0, -555), white));
   scene.add(new Quad(vec3(0, 0, 555), vec3(555, 0, 0), vec3(0, 555, 0), white));

   scene.add(new Box(vec3(130, 0, 65), vec3(295, 165, 230), white));
   scene.add(new Box(vec3(265, 0, 295), vec3(430, 330, 460), white));

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

const CornellBoxCamera = {
   spp: 50,
   maxDepth: 50,
   background: vec3(0, 0, 0),
   vFov: 40,
   lookFrom: vec3(278, 278, -800),
   lookAt: vec3(278, 278, 0),
   vUp: vec3(0, 1, 0),
   defocusAngle: 0
};

const SCENE_NAMES = ['Test Scene', 'Spheres', 'Quads', 'Dark', 'Earth', 'Perlin Noise', 'Cornell Box'];
const SCENE_LIST = {
   'Test Scene': {
      scene: TestScene,
      camera: TestSceneCamera
   },
   Spheres: {
      scene: DemoScene,
      camera: DemoSceneCamera
   },
   Quads: {
      scene: QuadsScene,
      camera: QuadsSceneCamera
   },
   Dark: {
      scene: DarkScene,
      camera: DarkSceneCamera
   },
   Earth: {
      scene: EarthScene,
      camera: EarthSceneCamera
   },
   'Perlin Noise': {
      scene: PerlinScene,
      camera: PerlinScenCamera,
   },
   'Cornell Box': {
      scene: CornellBox,
      camera: CornellBoxCamera
   }
};

export { SCENE_NAMES, SCENE_LIST };
