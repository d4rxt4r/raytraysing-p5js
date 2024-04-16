import { deg2rad } from '../utils/math.js';
import { Vector, vec3, randVec3InNormDisk } from '../utils/vector.js';
import Interval from './Interval.js';
import Ray from './Ray.js';

const { add, sub, mul, normalize, cross, scale, dot } = Vector;

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

export default class Camera {
   constructor(iw, ih, settings = {}) {
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
   }

   init() {
      this.pixelSamplesScale = 1 / this.spp;
      this.center = this.lookFrom.copy();

      const theta = deg2rad(this.vFov);
      const h = Math.tan(theta / 2);

      this.viewportHeight = 2 * h * this.focusDist;
      this.viewportWidth = this.viewportHeight * (this.imageWidth / this.imageHeight);

      this.w = normalize(sub(this.lookFrom, this.lookAt));
      this.u = normalize(cross(this.vUp, this.w));
      this.v = cross(this.w, this.u);

      const viewportU = scale(this.u, this.viewportWidth);
      const viewportV = scale(scale(this.v, -1), this.viewportHeight);

      this._pixelDeltaU = scale(viewportU, 1 / this.imageWidth);
      this._pixelDeltaV = scale(viewportV, 1 / this.imageHeight);

      const viewportUL = sub(this.center, scale(this.w, this.focusDist))
         .sub(scale(viewportU, 1 / 2))
         .sub(scale(viewportV, 1 / 2));

      this._pixel00Loc = viewportUL.add(add(this._pixelDeltaU, this._pixelDeltaV));

      const defocusRadius = this.focusDist * Math.tan(deg2rad(this.defocusAngle / 2));
      this._defocusDiskU = scale(this.u, defocusRadius);
      this._defocusDiskV = scale(this.v, defocusRadius);
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
      const rayOrigin = this.defocusAngle <= 0 ? this.center.copy() : this.defocusDiskSample();
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
      // fixme: camera must be preinitialized
      if (!this._pixel00Loc) {
         this.init();
      }

      let pixelColor = BLACK_CLR;
      for (let sample = 0; sample < this.spp; sample++) {
         const ray = this.getRay(x, y);
         pixelColor = add(pixelColor, this.getRayColor(scene, ray, this.maxDepth));
      }

      return scale(pixelColor, this.pixelSamplesScale);
   }
}
