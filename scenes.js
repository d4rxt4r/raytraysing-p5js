import { Vector, vec3, point3 } from './utils/vector.js';
import { randomDouble } from './utils/math.js';
import { LOADED_TEX, color, randomColor } from './utils/image.js';
import { HittableList } from './classes/Hittable.js';
import { Sphere, Quad, Box, ConstantMedium } from './classes/Objects.js';
import { Translate, RotateY } from './classes/Instances.js';
import { Material, Diffuse, Metal, Dielectric, DiffusedLight } from './classes/Materials.js';
import { CheckerBoard, ImageTexture, NoiseTexture, MarbleTexture } from './classes/Texture.js';
import BHVNode from './classes/BHVNode.js';

const { add, sub } = Vector;

function initScene(scene) {
   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

function defaultLights() {
   return new HittableList(new Box(vec3(-1, -1, -1), vec3(1, 1, 1), new Material()));
}

function CornellBoxBase() {
   const scene = new HittableList();

   const red = new Diffuse(vec3(0.65, 0.05, 0.05));
   const white = new Diffuse(vec3(0.73, 0.73, 0.73));
   const green = new Diffuse(vec3(0.12, 0.45, 0.15));
   const light = new DiffusedLight(vec3(15, 15, 15));

   // Cornell box sides
   scene.add(new Quad(point3(555, 0, 0), vec3(0, 0, 555), vec3(0, 555, 0), green));
   scene.add(new Quad(point3(0, 0, 555), vec3(0, 0, -555), vec3(0, 555, 0), red));
   scene.add(new Quad(point3(0, 555, 0), vec3(555, 0, 0), vec3(0, 0, 555), white));
   scene.add(new Quad(point3(0, 0, 555), vec3(555, 0, 0), vec3(0, 0, -555), white));
   scene.add(new Quad(point3(555, 0, 555), vec3(-555, 0, 0), vec3(0, 555, 0), white));
   // Light
   scene.add(new Quad(point3(213, 554, 227), vec3(130, 0, 0), vec3(0, 0, 105), light));

   return scene;
}

function CornellBoxBaseLights() {
   const lights = new HittableList();
   lights.add(new Quad(point3(213, 554, 227), vec3(130, 0, 0), vec3(0, 0, 105), new Material()));

   return lights;
}

const CornellBoxBaseCamera = {
   spp: 200,
   maxDepth: 50,
   background: vec3(0, 0, 0),
   vFov: 45,
   lookFrom: vec3(278, 278, -800),
   lookAt: vec3(278, 278, 0),
   vUp: vec3(0, 1, 0),
   defocusAngle: 0
};

function MovingSpheres(camera) {
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
               const centerOffset = add(center, vec3(0, randomDouble(0, 0.5), 0));
               scene.add(new Sphere(center, 0.2, new Diffuse(albedo), centerOffset));
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

function FinaleScene() {
   const ground = new Diffuse(color(0.48, 0.83, 0.53));
   const boxes1 = new HittableList();
   const boxes_per_side = 5;
   for (let i = 0; i < boxes_per_side; i++) {
      for (let j = 0; j < boxes_per_side; j++) {
         const w = 400.0;
         const x0 = -1000.0 + i * w;
         const z0 = -1000.0 + j * w;
         const y0 = 0.0;
         const x1 = x0 + w;
         const y1 = randomDouble(1, 101);
         const z1 = z0 + w;

         boxes1.add(new Box(point3(x0, y0, z0), point3(x1, y1, z1), ground));
      }
   }

   const scene = new HittableList();
   scene.add(boxes1);

   const light = new DiffusedLight(color(7, 7, 7));
   scene.add(new Quad(point3(123, 554, 147), vec3(300, 0, 0), vec3(0, 0, 265), light));

   const center1 = point3(400, 400, 200);
   const center2 = vec3(30, 0, 0).add(center1);
   const sphere_material = new Diffuse(color(0.7, 0.3, 0.1));
   scene.add(new Sphere(center1, 50, sphere_material, center2));

   scene.add(new Sphere(point3(260, 150, 45), 50, new Dielectric(1.5)));
   scene.add(new Sphere(point3(0, 150, 145), 50, new Metal(color(0.8, 0.8, 0.9), 1.0)));

   let boundary = new Sphere(point3(360, 150, 145), 70, new Dielectric(1.5));
   scene.add(boundary);
   scene.add(new ConstantMedium(boundary, 0.03, color(0.2, 0.4, 0.9)));

   boundary = new Sphere(point3(0, 0, 0), 5000, new Dielectric(1.5));
   scene.add(new ConstantMedium(boundary, 0.0001, color(1, 1, 1)));

   const eMat = new Diffuse(new ImageTexture(LOADED_TEX[0]));
   scene.add(new Sphere(point3(400, 200, 400), 100, eMat));
   const perText = new NoiseTexture(0.2);
   scene.add(new Sphere(point3(220, 280, 300), 80, new Diffuse(perText)));

   const boxes2 = new HittableList();
   const white = new Diffuse(color(0.73, 0.73, 0.73));
   const ns = 1000;
   for (let j = 0; j < ns; j++) {
      boxes2.add(new Sphere(Vector.random(0, 165), 10, white));
   }
   scene.add(new Translate(new RotateY(boxes2, 15), vec3(-100, 270, 395)));

   return initScene(scene);
}

const FinaleSceneCamera = {
   spp: 200,
   maxDepth: 100,
   background: color(0, 0, 0),
   vFov: 40,
   lookFrom: point3(478, 278, -600),
   lookAt: point3(278, 278, 0),
   vUp: vec3(0, 1, 0),
   defocusAngle: 0
};

const SCENE_LIST = {
   'Test Scene': {
      scene() {
         const scene = new HittableList();

         scene.add(new Sphere(vec3(0, -100.5, 0), 100, new Diffuse(color(0.2, 0.5, 0.7))));
         scene.add(new Sphere(vec3(0.7, 0, -1), 0.4, new Dielectric(1.5)));
         scene.add(new Sphere(vec3(0.7, 0, -1), 0.3, new Dielectric(1 / 1.5)));
         scene.add(new Sphere(vec3(-0.7, 0, -0.3), 0.3, new Metal(vec3(0.8, 0.8, 0.8), 0)));

         let box = new Box(vec3(0, 0, 0), vec3(0.6, 0.6, 0.6), new Material());
         box = new Translate(box, vec3(-0.3, -0.35, -0.3));
         box = new RotateY(box, -25);

         scene.add(new ConstantMedium(box, 5, color(0, 0, 0)));

         return initScene(scene);
      },
      lights: defaultLights,
      camera: {
         background: vec3(0.7, 0.8, 1),
         spp: 100,
         renderRes: 0.3,
         maxDepth: 50,
         vFov: 30,
         defocusAngle: 1,
         focusDist: 8,
         lookFrom: vec3(0, 3, -8),
         lookAt: vec3(0, -0.2, 0)
      }
   },
   'Moving Spheres': {
      scene: MovingSpheres,
      lights: defaultLights,
      camera: {
         spp: 20,
         maxDepth: 10,
         vFov: 20,
         lookFrom: vec3(13, 2, 3),
         lookAt: vec3(0, 0, 0),
         defocusAngle: 0.6,
         focusDist: 10
      }
   },
   Quads: {
      scene() {
         const scene = new HittableList();

         scene.add(new Quad(vec3(-3, -2, 5), vec3(0, 0, -4), vec3(0, 4, 0), new Diffuse(vec3(1.0, 0.2, 0.2))));
         scene.add(new Quad(vec3(-2, -2, 0), vec3(4, 0, 0), vec3(0, 4, 0), new Diffuse(vec3(0.2, 1.0, 0.2))));
         scene.add(new Quad(vec3(3, -2, 1), vec3(0, 0, 4), vec3(0, 4, 0), new Diffuse(vec3(0.2, 0.2, 1.0))));
         scene.add(new Quad(vec3(-2, 3, 1), vec3(4, 0, 0), vec3(0, 0, 4), new Diffuse(vec3(1.0, 0.5, 0.0))));
         scene.add(new Quad(vec3(-2, -3, 5), vec3(4, 0, 0), vec3(0, 0, -4), new Diffuse(vec3(0.2, 0.8, 0.8))));

         return initScene(scene);
      },
      lights: defaultLights,
      camera: {
         spp: 100,
         maxDepth: 50,
         vFov: 80,
         lookFrom: vec3(0, 0, 9),
         lookAt: vec3(0, 0, 0),
         vUp: vec3(0, 1, 0),
         defocusAngle: 0
      }
   },
   Dark: {
      scene() {
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
         scene.add(new Quad(vec3(-3, 0.5, -3), vec3(3, 0, 0), vec3(0, 2, 0), new DiffusedLight(vec3(7, 8, 10))));

         return initScene(scene);
      },
      lights() {
         const lights = new HittableList();
         lights.add(new Quad(vec3(-3, 0, -3), vec3(3, 0, 0), vec3(0, 3, 0), new Material()));
         return lights;
      },
      camera: {
         lookFrom: vec3(26, 3, 6),
         lookAt: vec3(0, 2, 0),
         spp: 1000,
         maxDepth: 200,
         vFov: 15,
         defocusAngle: 0,
         focusDist: 6,
         background: vec3(0, 0, 0)
      }
   },
   Earth: {
      scene() {
         const scene = new HittableList(new Sphere(vec3(0, 0, 0), 2, new Diffuse(new ImageTexture(LOADED_TEX[0]))));
         return initScene(scene);
      },
      lights() {
         const lights = new HittableList();
         lights.add(new Quad(vec3(-25, 0, 25), vec3(0, 0, -50), vec3(50, 0, 0), new Material()));
         return lights;
      },
      camera: {
         spp: 100,
         maxDepth: 50,
         vFov: 20,
         lookFrom: vec3(0, 0, 12),
         lookAt: vec3(0, 0, 0),
         vUp: vec3(0, 1, 0),
         defocusAngle: 0
      }
   },
   'Perlin Noise': {
      scene() {
         const scene = new HittableList();
         const noiseTex = new NoiseTexture(4);
         const turbTex = new MarbleTexture(3);

         scene.add(new Sphere(vec3(0, -1000, 0), 1000, new Diffuse(noiseTex)));
         scene.add(new Sphere(vec3(0, 2, 0), 2, new Diffuse(turbTex)));

         return initScene(scene);
      },
      lights: defaultLights,
      camera: {
         spp: 100,
         maxDepth: 50,
         vFov: 30,
         lookFrom: vec3(13, 4, 3),
         lookAt: vec3(0, 1, 0),
         vUp: vec3(0, 1, 0),
         defocusAngle: 0
      }
   },
   'Cornell Box': {
      scene() {
         const scene = CornellBoxBase();
         const white = new Diffuse(vec3(0.73, 0.73, 0.73));

         // Box 1
         let box1 = new Box(point3(0, 0, 0), point3(165, 330, 165), white);
         box1 = new RotateY(box1, 15);
         box1 = new Translate(box1, vec3(265, 0, 295));
         scene.add(box1);

         // Box 2
         let box2 = new Box(point3(0, 0, 0), point3(165, 165, 165), white);
         box2 = new RotateY(box2, -18);
         box2 = new Translate(box2, vec3(130, 0, 65));
         scene.add(box2);

         return initScene(scene);
      },
      lights: CornellBoxBaseLights,
      camera: CornellBoxBaseCamera
   },
   'Cornell Box Smoke': {
      scene() {
         const scene = CornellBoxBase();
         const white = new Diffuse(vec3(0.73, 0.73, 0.73));

         let box1 = new Box(point3(0, 0, 0), point3(165, 330, 165), white);
         box1 = new RotateY(box1, 15);
         box1 = new Translate(box1, vec3(265, 0, 295));

         let box2 = new Box(point3(0, 0, 0), point3(165, 165, 165), white);
         box2 = new RotateY(box2, -18);
         box2 = new Translate(box2, vec3(130, 0, 65));

         scene.add(new ConstantMedium(box1, 0.01, color(0, 0, 0)));
         scene.add(new ConstantMedium(box2, 0.01, color(1, 1, 1)));

         return initScene(scene);
      },
      lights: CornellBoxBaseLights,
      camera: CornellBoxBaseCamera
   },
   'Cornell Box Metal': {
      scene() {
         const scene = CornellBoxBase();
         const white = new Diffuse(vec3(0.73, 0.73, 0.73));

         // Box 1
         let box1 = new Box(point3(0, 0, 0), point3(165, 330, 165), new Metal(color(0.8, 0.8, 0.8)));
         box1 = new RotateY(box1, 15);
         box1 = new Translate(box1, vec3(265, 0, 295));
         scene.add(box1);

         // Box 2
         let box2 = new Box(point3(0, 0, 0), point3(165, 165, 165), white);
         box2 = new RotateY(box2, -18);
         box2 = new Translate(box2, vec3(130, 0, 65));
         scene.add(box2);

         return initScene(scene);
      },
      lights: CornellBoxBaseLights,
      camera: CornellBoxBaseCamera
   },
   'Cornell Box Glass': {
      scene() {
         const scene = CornellBoxBase();
         const white = new Diffuse(vec3(0.73, 0.73, 0.73));
         // Box
         let box1 = new Box(point3(0, 0, 0), point3(165, 330, 165), white);
         box1 = new RotateY(box1, 15);
         box1 = new Translate(box1, vec3(265, 0, 295));
         scene.add(box1);
         // Glass Sphere
         const glass = new Dielectric(1.5);
         scene.add(new Sphere(point3(190, 90, 190), 90, glass));

         return initScene(scene);
      },
      lights() {
         const lights = CornellBoxBaseLights();
         lights.add(new Sphere(point3(190, 90, 190), 90, new Material()));

         return lights;
      },
      camera: CornellBoxBaseCamera
   },
   'Final Demo': {
      scene: FinaleScene,
      lights: defaultLights,
      camera: FinaleSceneCamera
   }
};

const SCENE_NAMES = Object.keys(SCENE_LIST);

export { SCENE_NAMES, SCENE_LIST };
