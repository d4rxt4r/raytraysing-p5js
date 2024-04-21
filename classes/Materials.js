import { Vector } from '../utils/vector.js';
import { color } from '../utils/image.js';
import { Texture, SolidColor } from './Texture.js';
import { CosinePDF, SpherePDF } from './PDF.js';
import ScatterRecord from './ScatterRecord.js';
import HitRecord from './HitRecord.js';
import Ray from './Ray.js';

const { normalize, scale, dot, reflect, refract, nearZero } = Vector;

class Material {
   /**
    * @param {Ray} rayIn
    * @param {HitRecord} hRec
    * @param {ScatterRecord} sRec
    */
   scatter(rayIn, hRec, sRec) {
      return false;
   }

   /**
    * @param {Ray} rayIn
    * @param {HitRecord} rec
    * @param {Vector} u
    * @param {Vector} v
    * @param {Vector} p
    */
   emitted(rayIn, rec, u, v, p) {
      return color(0, 0, 0);
   }

   scatteringPDF(rayIn, hRec, scattered) {
      return 0;
   }
}

class Lambertian extends Material {
   /**
    * @param {Texture|SolidColor}
    */
   #texture;

   constructor(arg) {
      super();

      if (arg instanceof Texture) {
         this.#texture = arg;
         return;
      }

      this.#texture = new SolidColor(arg);
   }

   /**
    * @param {Ray} rayIn
    * @param {HitRecord} hRec
    * @param {ScatterRecord} sRec
    */
   scatter(rayIn, hRec, sRec) {
      sRec.attenuation = this.#texture.value(hRec.u, hRec.v, hRec.p);
      sRec.pdf = new CosinePDF(hRec.normal);
      sRec.skipPDF = false;

      return true;
   }

   scatteringPDF(rayIn, hRec, scattered) {
      const cosine = dot(hRec.normal, normalize(scattered.direction));
      return Math.max(0, cosine / Math.PI);
   }
}

class Metal extends Material {
   /**
    * @param {Vector}
    */
   #albedo;
   /**
    * @param {number}
    */
   #fuzz;

   constructor(albedo, fuzz = 0) {
      super();
      this.#albedo = albedo;
      this.#fuzz = fuzz < 1 ? fuzz : 1;
   }

   /**
    * @param {Ray} ray
    * @param {HitRecord} hRec
    * @param {ScatterRecord} sRec
    */
   scatter(rayIn, hRec, sRec) {
      let reflected = reflect(rayIn.direction, hRec.normal);
      reflected.normalize().add(scale(Vector.randomNorm(), this.#fuzz));

      sRec.attenuation = this.#albedo;
      sRec.pdf = null;
      sRec.skipPDF = true;
      sRec.skipPDFRay = new Ray(hRec.p, reflected, rayIn.time);

      return true;
   }
}

class Dielectric extends Material {
   /**
    * @param {number}
    */
   #refIndex;

   constructor(refIndex = 1) {
      super();

      this.#refIndex = refIndex;
   }

   #reflectance(cosine, ri) {
      let r0 = (1 - ri) / (1 + ri);
      r0 *= r0;
      return r0 + (1 - r0) * Math.pow(1 - cosine, 5);
   }

   /**
    * @param {Ray} ray
    * @param {HitRecord} hRec
    * @param {ScatterRecord} sRec
    */
   scatter(rayIn, hRec, sRec) {
      sRec.attenuation = color(1, 1, 1);
      sRec.pdf = null;
      sRec.skipPDF = true;
      const ri = hRec.frontFace ? 1 / this.#refIndex : this.#refIndex;

      const unitDirection = normalize(rayIn.direction);
      const cosTheta = Math.min(dot(scale(unitDirection, -1), hRec.normal), 1);
      const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);

      const cantRefract = ri * sinTheta > 1;
      let direction;

      if (cantRefract || this.#reflectance(cosTheta, ri) > Math.random()) {
         direction = reflect(unitDirection, hRec.normal);
      } else {
         direction = refract(unitDirection, hRec.normal, ri);
      }

      sRec.skipPDFRay = new Ray(hRec.p, direction, rayIn.time);

      return true;
   }
}

class DiffusedLight extends Material {
   /**
    * @param {Texture|SolidColor}
    */
   #texture;

   constructor(arg) {
      super();

      if (arg instanceof Texture) {
         this.#texture = arg;
      } else {
         this.#texture = new SolidColor(arg);
      }
   }

   /**
    * @param {Ray} rayIn
    * @param {HitRecord} hitRec
    * @param {Vector} u
    * @param {Vector} v
    * @param {Vector} p
    */
   emitted(rayIn, hitRec, u, v, p) {
      if (!hitRec.frontFace) {
         return color(0, 0, 0);
      }

      return this.#texture.value(u, v, p);
   }
}

class Isotropic extends Material {
   /**
    * @param {Texture|SolidColor}
    */
   #texture;

   constructor(arg) {
      super();

      if (arg instanceof Texture) {
         this.#texture = arg;
      } else {
         this.#texture = new SolidColor(arg);
      }
   }

   scatter(rayIn, hRec, sRec) {
      sRec.attenuation = this.#texture.value(hRec.u, hRec.v, hRec.p);
      sRec.pdf = new SpherePDF();
      sRec.skipPDF = false;

      return true;
   }

   scatteringPDF() {
      return 1 / (4 * Math.PI);
   }
}

export { Material, Lambertian as Diffuse, Metal, Dielectric, DiffusedLight, Isotropic };
