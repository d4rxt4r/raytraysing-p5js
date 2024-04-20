import { int, deg2rad } from '../utils/math.js';
import { Vector, vec3 } from '../utils/vector.js';
import { color } from '../utils/image.js';
import HitRecord from './HitRecord.js';
import Interval from './Interval.js';
import Ray from './Ray.js';

const { add, sub, mul, cross, scale } = Vector;

const DT = new Interval(0.001, Infinity);

export default class Camera {
   imageWidth;
   imageHeight;
   maxDepth;

   #center;
   #pixelSamplesScale;
   #sqrtSpp;
   #invSqrtSpp;
   #viewportHeight;
   #viewportWidth;
   #w;
   #u;
   #v;
   #pixelDeltaU;
   #pixelDeltaV;
   #pixel00Loc;
   #defocusDiskU;
   #defocusDiskV;

   constructor(iw = 100, ih = 100, settings = {}) {
      this.imageWidth = iw;
      this.imageHeight = ih;
      this.maxDepth = settings.maxDepth || 20;
      this.spp = settings.spp || 30;
      this.defocusAngle = settings.defocusAngle || 0;
      this.focusDist = settings.focusDist || 1;
      this.vFov = settings.vFov || 90;
      this.lookFrom = settings.lookFrom || vec3(0, 0, 0);
      this.lookAt = settings.lookAt || vec3(0, 0, -1);
      this.vUp = settings.vUp || vec3(0, 1, 0);
      this.background = settings.background || vec3(0.7, 0.8, 1.0);
   }

   init() {
      this.#sqrtSpp = int(Math.sqrt(this.spp));
      this.#pixelSamplesScale = 1 / (this.#sqrtSpp * this.#sqrtSpp);
      this.#invSqrtSpp = 1 / this.#sqrtSpp;

      this.#center = this.lookFrom.copy();

      this.#viewportHeight = 2 * Math.tan(deg2rad(this.vFov) / 2) * this.focusDist;
      this.#viewportWidth = this.#viewportHeight * (this.imageWidth / this.imageHeight);

      this.#w = sub(this.lookFrom, this.lookAt).normalize();
      this.#u = cross(this.vUp, this.#w).normalize();
      this.#v = cross(this.#w, this.#u);

      const viewportU = scale(this.#u, this.#viewportWidth);
      const viewportV = scale(this.#v, -this.#viewportHeight);

      this.#pixelDeltaU = scale(viewportU, 1 / this.imageWidth);
      this.#pixelDeltaV = scale(viewportV, 1 / this.imageHeight);

      const viewportUL = sub(this.#center, scale(this.#w, this.focusDist))
         .sub(viewportU.scale(1 / 2))
         .sub(viewportV.scale(1 / 2));

      this.#pixel00Loc = add(this.#pixelDeltaU, this.#pixelDeltaV).add(viewportUL);

      const defocusRadius = this.focusDist * Math.tan(deg2rad(this.defocusAngle / 2));
      this.#defocusDiskU = scale(this.#u, defocusRadius);
      this.#defocusDiskV = scale(this.#v, defocusRadius);
   }

   #sampleSquareStratified(si, sj) {
      const px = (si + Math.random()) * this.#invSqrtSpp - 0.5;
      const py = (sj + Math.random()) * this.#invSqrtSpp - 0.5;

      return vec3(px, py, 0);
   }

   #defocusDiskSample() {
      const p = Vector.randomNormDisk();
      return add(this.#center, scale(this.#defocusDiskU, p.x)).add(scale(this.#defocusDiskV, p.y));
   }

   #getRay(i, j, si, sj) {
      const offset = this.#sampleSquareStratified(si, sj);
      const pixelSample = add(this.#pixel00Loc, scale(this.#pixelDeltaU, i + offset.x)).add(
         scale(this.#pixelDeltaV, j + offset.y)
      );
      const rayOrigin = this.defocusAngle <= 0 ? this.#center.copy() : this.#defocusDiskSample();
      return new Ray(rayOrigin, sub(pixelSample, rayOrigin), Math.random());
   }

   #getRayColor(scene, ray, depth) {
      if (depth <= 0) {
         return color(0, 0, 0);
      }

      const hitRec = new HitRecord();

      if (!scene.hit(ray, DT, hitRec)) {
         return this.background;
      }

      const { scatter, attenuation, scattered } = hitRec.mat.scatter(ray, hitRec);
      const colorFromEmission = hitRec.mat.emitted(hitRec, hitRec.u, hitRec.v, hitRec.p);

      if (!scatter) {
         return colorFromEmission;
      }

      const colorFromScatter = mul(attenuation, this.#getRayColor(scene, scattered, depth - 1));
      return colorFromEmission.add(colorFromScatter);
   }

   render(scene, x, y) {
      if (!this.#pixel00Loc) {
         this.init();
      }

      const pixelColor = color(0, 0, 0);
      for (let sj = 0; sj < this.#sqrtSpp; sj++) {
         for (let si = 0; si < this.#sqrtSpp; si++) {
            pixelColor.add(this.#getRayColor(scene, this.#getRay(x, y, si, sj), this.maxDepth));
         }
      }

      return pixelColor.scale(this.#pixelSamplesScale);
   }
}
