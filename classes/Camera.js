import { deg2rad } from '../utils/math.js';
import { Vector, vec3 } from '../utils/vector.js';
import { color } from '../utils/image.js';
import HitRecord from './HitRecord.js';
import Interval from './Interval.js';
import Ray from './Ray.js';

const { add, sub, mul, cross, scale } = Vector;

const DT = new Interval(0.001, Infinity);

export default class Camera {
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
      this.pixelSamplesScale = 1 / this.spp;
      this.center = this.lookFrom.copy();

      const theta = deg2rad(this.vFov);
      const h = Math.tan(theta / 2);

      this.viewportHeight = 2 * h * this.focusDist;
      this.viewportWidth = this.viewportHeight * (this.imageWidth / this.imageHeight);

      this.w = sub(this.lookFrom, this.lookAt).normalize();
      this.u = cross(this.vUp, this.w).normalize();
      this.v = cross(this.w, this.u);

      const viewportU = scale(this.u, this.viewportWidth);
      const viewportV = scale(this.v, -this.viewportHeight);

      this._pixelDeltaU = scale(viewportU, 1 / this.imageWidth);
      this._pixelDeltaV = scale(viewportV, 1 / this.imageHeight);

      const viewportUL = sub(this.center, scale(this.w, this.focusDist))
         .sub(viewportU.scale(1 / 2))
         .sub(viewportV.scale(1 / 2));

      this._pixel00Loc = add(this._pixelDeltaU, this._pixelDeltaV).add(viewportUL);

      const defocusRadius = this.focusDist * Math.tan(deg2rad(this.defocusAngle / 2));
      this._defocusDiskU = scale(this.u, defocusRadius);
      this._defocusDiskV = scale(this.v, defocusRadius);
   }

   #sampleSquare() {
      return vec3(Math.random() - 0.5, Math.random() - 0.5, 0);
   }

   #defocusDiskSample() {
      const p = Vector.randomNormDisk();
      return add(this.center, scale(this._defocusDiskU, p.x)).add(scale(this._defocusDiskV, p.y));
   }

   #getRay(i, j) {
      const offset = this.#sampleSquare();
      const pixelSample = add(this._pixel00Loc, scale(this._pixelDeltaU, i + offset.x)).add(
         scale(this._pixelDeltaV, j + offset.y)
      );
      const rayOrigin = this.defocusAngle <= 0 ? this.center.copy() : this.#defocusDiskSample();
      const rayDirection = sub(pixelSample, rayOrigin);
      const rayTime = Math.random();

      return new Ray(rayOrigin, rayDirection, rayTime);
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
      if (!this._pixel00Loc) {
         this.init();
      }

      const pixelColor = color(0, 0, 0);
      for (let sample = 0; sample < this.spp; sample++) {
         const ray = this.#getRay(x, y);
         pixelColor.add(this.#getRayColor(scene, ray, this.maxDepth));
      }

      return pixelColor.scale(this.pixelSamplesScale);
   }
}
