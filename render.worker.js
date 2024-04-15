import { Vector, vec3, randVec3InNormDisk } from './utils/vector.js';
// import PCamera from './classes/Camera.js';
import Interval from './classes/Interval.js';
import Ray from './classes/Ray.js';

import { TestScene, DemoScene } from './scenes.js';

const { add, sub, mul, normalize, scale, dot, copy } = Vector;

const DT = new Interval(0.001, Infinity);
const BLACK_CLR = vec3(0, 0, 0);

class HitRecord {
   constructor({ point, normal, t } = {}) {
      this.p = point;
      this.normal = normal;
      this.t = t;
      this.mat = null;
   }

   setFaceNormal(ray, outward_normal) {
      this.frontFace = dot(ray.direction, outward_normal) < 0;
      this.normal = this.frontFace ? outward_normal : scale(outward_normal, -1);
   }
}

// TODO: use main camera class
class SCamera {
   constructor(camera) {
      this.spp = camera.spp;
      this.maxDepth = camera.maxDepth;
      this.center = camera.center;
      this.defocusAngle = camera.defocusAngle;
      this.pixelSamplesScale = camera.pixelSamplesScale;
      this._defocusDiskU = camera._defocusDiskU;
      this._defocusDiskV = camera._defocusDiskV;
      this._pixel00Loc = camera._pixel00Loc;
      this._pixelDeltaU = camera._pixelDeltaU;
      this._pixelDeltaV = camera._pixelDeltaV;
   }

   sampleSquare() {
      return vec3(Math.random() - 0.5, Math.random() - 0.5, 0);
   }

   defocusDiskSample() {
      const p = randVec3InNormDisk();
      return add(this.center, scale(this._defocusDiskU, p.x)).add(scale(this._defocusDiskV, p.y));
   }

   getRay(i, j) {
      const offset = this.sampleSquare();
      const pixelSample = add(
         add(this._pixel00Loc, scale(this._pixelDeltaU, i + offset.x)),
         scale(this._pixelDeltaV, j + offset.y)
      );
      const rayOrigin = this.defocusAngle <= 0 ? copy(this.center) : this.defocusDiskSample();
      const rayDirection = sub(pixelSample, rayOrigin);

      return new Ray(rayOrigin, rayDirection);
   }

   getRayColor(scene, ray, depth) {
      if (depth <= 0) {
         return BLACK_CLR;
      }

      const hitRec = new HitRecord();
      if (scene.hit(ray, DT, hitRec)) {
         const { scatter, attenuation, scattered } = hitRec.mat.scatter(ray, hitRec);
         if (scatter) {
            return mul(attenuation, this.getRayColor(scene, scattered, depth - 1));
         }
         return BLACK_CLR;
      }

      const a = 0.5 * (normalize(ray.direction).y + 1.0);
      // same as add3(mul3(vec3(1, 1, 1), 1 - a), mul3(vec3(0.5, 0.7, 1), a));
      return vec3(1.0 - a + a * 0.5, 1.0 - a + a * 0.7, 1);
   }

   render(scene, x, y) {
      let pixelColor = BLACK_CLR;
      for (let sample = 0; sample < this.spp; sample++) {
         const ray = this.getRay(x, y);
         pixelColor = add(pixelColor, this.getRayColor(scene, ray, this.maxDepth));
      }

      return scale(pixelColor, this.pixelSamplesScale);
   }
}

let Scene;
let Camera;
let pixelColor;
onmessage = (e) => {
   const { action, camera, x, y } = e.data;

   if (action === 'render') {
      pixelColor = Camera.render(Scene, x, y);
      postMessage({ x, y, color: pixelColor });
      return;
   }

   if (action === 'initCamera') {
      if (!Scene) {
         Scene = new TestScene();
      }

      Camera = new SCamera(camera);
      return;
   }
};
