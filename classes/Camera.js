import { getPixelIndex, setImagePixel } from 'utils/image.js';
import { Interval, deg2rad, randomDouble } from 'utils/math.js';
import { HitRecord } from 'classes/Scene.js';
import Ray from 'classes/Ray.js';

const { add: add3, sub: sub3, mult: mul3, div: div3, normalize: normalize3, cross: cross3 } = p5.Vector;

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
      this.lookFrom = createVector(0, 0, 0);
      this.lookAt = createVector(0, 0, -1);
      this.vUp = createVector(0, 1, 0);
   }

   init() {
      this.pixelSamplesScale = 1 / this.spp;
      this.cameraCenter = this.lookFrom.copy();

      const focalLength = sub3(this.lookFrom, this.lookAt).mag();
      const theta = deg2rad(this.vFov);
      const h = Math.tan(theta / 2);

      this.vHeight = 2 * h * focalLength;
      this.vWidth = this.vHeight * (this.imageWidth / this.imageHeight);

      this.w = normalize3(sub3(this.lookFrom, this.lookAt));
      this.u = normalize3(cross3(this.vUp, this.w));
      this.v = cross3(this.w, this.u);

      const viewportU = mul3(this.u, this.vWidth);
      const viewportV = mul3(mul3(this.v, -1), this.vHeight);

      this.pixelDeltaU = div3(viewportU, this.imageWidth);
      this.pixelDeltaV = div3(viewportV, this.imageHeight);

      const viewportUL = sub3(this.cameraCenter, mul3(this.w, focalLength))
         .sub(div3(viewportU, 2))
         .sub(div3(viewportV, 2));

      this.pixel00Loc = add3(viewportUL).add(add3(this.pixelDeltaU, this.pixelDeltaV));
   }

   sampleSquare() {
      return createVector(randomDouble() - 0.5, randomDouble() - 0.5, 0);
   }

   getRay(i, j) {
      const offset = this.sampleSquare();
      const pixelSample = add3(
         add3(this.pixel00Loc, mul3(this.pixelDeltaU, i + offset.x)),
         mul3(this.pixelDeltaV, j + offset.y)
      );
      const rayOrigin = this.cameraCenter.copy();
      const rayDirection = sub3(pixelSample, rayOrigin);

      return new Ray(rayOrigin, rayDirection);
   }

   getRayColor(r, depth) {
      if (depth <= 0) {
         return createVector(0, 0, 0);
      }

      const hitRec = new HitRecord();
      if (this.scene.hit(r, DT, hitRec)) {
         const { scatter, attenuation, scattered } = hitRec.mat.scatter(r, hitRec);
         if (scatter) {
            return mul3(attenuation, this.getRayColor(scattered, depth - 1));
         }
         return createVector(0, 0, 0);

         // Lambertian Reflection
         // const dir = add3(hitRec.normal, randomUnitVector());
         // Simple Diffuse Material
         // const dir = randomOnHemisphere(hitRec.normal);
         // return mul3(this.getRayColor(new Ray(hitRec.p, dir), depth - 1), 0.5);
         // non-recursive normals color
         // return normalize3(add3(hitRec.normal, 0.5));
      }

      const unitDirection = normalize3(r.direction);
      const a = 0.5 * (unitDirection.y + 1.0);

      // same as add3(mul3(createVector(1, 1, 1), 1 - a), mul3(createVector(0.5, 0.7, 1), a));
      return createVector(1.0 - a + a * 0.5, 1.0 - a + a * 0.7, 1);
   }

   render(frameBuffer) {
      this.init();

      let index;
      for (let j = 0; j < this.imageHeight; j++) {
         for (let i = 0; i < this.imageWidth; i++) {
            index = getPixelIndex(i, j, this.imageWidth);
            const pixelColor = createVector(0, 0, 0);
            for (let sample = 0; sample < this.spp; sample++) {
               const ray = this.getRay(i, j);
               pixelColor.add(this.getRayColor(ray, MAX_RAY_DEPTH));
            }

            setImagePixel(frameBuffer.pixels, i, j, this.imageWidth, mul3(pixelColor, this.pixelSamplesScale));
         }
      }
   }
}
