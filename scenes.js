import { vec3 } from 'utils/vector.js';
import { HittableList } from 'classes/Scene.js';
import { BHVNode, Sphere } from 'classes/Objects.js';
import { FlatColor, Metal, Dielectric } from 'classes/Materials.js';

export function DemoScene(camera) {
   const scene = new HittableList();
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

   camera.spp = 20;
   camera.maxDepth = 10;
   camera.scene = world;
   camera.vFov = 20;
   camera.lookFrom = vec3(13, 2, 3);
   camera.lookAt = vec3(0, 0, 0);
   camera.defocusAngle = 0.6;
   camera.focusDist = 10;

   camera.init();

   return new HittableList(new BHVNode(scene.objects, 0, scene.objects.length));
}

export function TestScene(camera) {
   const scene = new HittableList();
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