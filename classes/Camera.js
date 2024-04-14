import { getPixelIndex, setImagePixel } from 'utils/image.js';
import { Interval, deg2rad } from 'utils/math.js';
import { vec3, Vector } from 'utils/vector.js';
import { HitRecord } from 'classes/Scene.js';
import Ray from 'classes/Ray.js';

const { add, sub, mul, normalize, cross, scale } = Vector;

const MAX_RAY_DEPTH = 20;
const SAMPLES_PER_PIXEL = 30;
const DT = new Interval(0.001, Infinity);

export class Camera {
   constructor(iw, ih, scene) {
      this.imageWidth = iw;
      this.imageHeight = ih;
      this.scene = scene;

      this.spp = SAMPLES_PER_PIXEL;
      this.vFov = 90;
      this.lookFrom = vec3(0, 0, 0);
      this.lookAt = vec3(0, 0, -1);
      this.vUp = vec3(0, 1, 0);
   }

   init() {
      this.pixelSamplesScale = 1 / this.spp;
      this.cameraCenter = this.lookFrom.copy();

      const focalLength = sub(this.lookFrom, this.lookAt).mag();
      const theta = deg2rad(this.vFov);
      const h = Math.tan(theta / 2);

      this.vHeight = 2 * h * focalLength;
      this.vWidth = this.vHeight * (this.imageWidth / this.imageHeight);

      this.w = normalize(sub(this.lookFrom, this.lookAt));
      this.u = normalize(cross(this.vUp, this.w));
      this.v = cross(this.w, this.u);

      const viewportU = scale(this.u, this.vWidth);
      const viewportV = scale(scale(this.v, -1), this.vHeight);

      this.pixelDeltaU = scale(viewportU, 1 / this.imageWidth);
      this.pixelDeltaV = scale(viewportV, 1 / this.imageHeight);

      const viewportUL = sub(this.cameraCenter, scale(this.w, focalLength))
         .sub(scale(viewportU, 1 / 2))
         .sub(scale(viewportV, 1 / 2));

      this.pixel00Loc = viewportUL.add(add(this.pixelDeltaU, this.pixelDeltaV));
   }

   sampleSquare() {
      return vec3(Math.random() - 0.5, Math.random() - 0.5, 0);
   }

   getRay(i, j) {
      const offset = this.sampleSquare();
      const pixelSample = add(
         add(this.pixel00Loc, scale(this.pixelDeltaU, i + offset.x)),
         scale(this.pixelDeltaV, j + offset.y)
      );
      const rayOrigin = this.cameraCenter.copy();
      const rayDirection = sub(pixelSample, rayOrigin);

      return new Ray(rayOrigin, rayDirection);
   }

   getRayColor(r, depth) {
      if (depth <= 0) {
         return vec3(0, 0, 0);
      }

      const hitRec = new HitRecord();
      if (this.scene.hit(r, DT, hitRec)) {
         const { scatter, attenuation, scattered } = hitRec.mat.scatter(r, hitRec);
         if (scatter) {
            return mul(attenuation, this.getRayColor(scattered, depth - 1));
         }
         return vec3(0, 0, 0);

         // Lambertian Reflection
         // const dir = add3(hitRec.normal, randomUnitVector());
         // Simple Diffuse Material
         // const dir = randomOnHemisphere(hitRec.normal);
         // return mul3(this.getRayColor(new Ray(hitRec.p, dir), depth - 1), 0.5);
         // non-recursive normals color
         // return normalize3(add3(hitRec.normal, 0.5));
      }

      const unitDirection = normalize(r.direction);
      const a = 0.5 * (unitDirection.y + 1.0);

      // same as add3(mul3(vec3(1, 1, 1), 1 - a), mul3(vec3(0.5, 0.7, 1), a));
      return vec3(1.0 - a + a * 0.5, 1.0 - a + a * 0.7, 1);
   }

   render(frameBuffer) {
      let index;
      for (let j = 0; j < this.imageHeight; j++) {
         for (let i = 0; i < this.imageWidth; i++) {
            index = getPixelIndex(i, j, this.imageWidth);
            let pixelColor = vec3(0, 0, 0);
            for (let sample = 0; sample < this.spp; sample++) {
               const ray = this.getRay(i, j);
               pixelColor = add(pixelColor, this.getRayColor(ray, MAX_RAY_DEPTH));
            }

            setImagePixel(frameBuffer, i, j, this.imageWidth, scale(pixelColor, this.pixelSamplesScale));
         }
      }
   }
}
