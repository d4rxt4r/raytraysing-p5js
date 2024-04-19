import { Vector } from '../utils/vector.js';
import { color } from '../utils/image.js';
import { Texture, SolidColor } from './Texture.js';
import { HitRecord } from './Camera.js';
import Ray from './Ray.js';

const { normalize, scale, dot, reflect, refract, nearZero } = Vector;

class Material {
   /**
    * @param {Ray} ray
    * @param {HitRecord} hitRec
    */
   scatter(ray, hitRec) {
      return false;
   }

   /**
    * @param {HitRecord} hitRec
    * @param {Vector} u
    * @param {Vector} v
    * @param {Vector} p
    */
   emitted(hitRec, u, v, p) {
      return color(0, 0, 0);
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
    * @param {Ray} ray
    * @param {HitRecord} hitRec
    */
   scatter(ray, hitRec) {
      let scatterDirection = Vector.randomNorm().add(hitRec.normal);
      if (nearZero(scatterDirection)) {
         scatterDirection = hitRec.normal;
      }

      return {
         scatter: true,
         scattered: new Ray(hitRec.p, scatterDirection),
         attenuation: this.#texture.value(hitRec.u, hitRec.v, hitRec.p)
      };
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
    * @param {HitRecord} hitRec
    */
   scatter(rayIn, hitRec) {
      let reflected = reflect(rayIn.direction, hitRec.normal);
      if (this.#fuzz) {
         reflected.normalize().add(Vector.randomNorm().scale(this.#fuzz));
      }
      const scattered = new Ray(hitRec.p, reflected);

      return {
         scatter: dot(scattered.direction, hitRec.normal) > 0,
         scattered,
         attenuation: this.#albedo
      };
   }
}

class Dielectric extends Material {
   /**
    * @param {number}
    */
   #refIndex;

   constructor(refIndex) {
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
    * @param {HitRecord} hitRec
    */
   scatter(rayIn, hitRec) {
      const ri = hitRec.frontFace ? 1 / this.#refIndex : this.#refIndex;
      const unitDirection = normalize(rayIn.direction);
      const cosTheta = Math.min(dot(scale(unitDirection, -1), hitRec.normal), 1);
      const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
      const cantRefract = ri * sinTheta > 1;

      let direction;
      if (cantRefract || this.#reflectance(cosTheta, ri) > Math.random()) {
         direction = reflect(unitDirection, hitRec.normal);
      } else {
         direction = refract(unitDirection, hitRec.normal, ri);
      }

      return {
         scatter: true,
         scattered: new Ray(hitRec.p, direction),
         attenuation: color(1, 1, 1)
      };
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
         return;
      }

      this.#texture = new SolidColor(arg);
   }

   /**
    * @param {HitRecord} hitRec
    * @param {Vector} u
    * @param {Vector} v
    * @param {Vector} p
    */
   emitted(hitRec, u, v, p) {
      if (!hitRec.frontFace) {
         return color(0, 0, 0);
      }

      return this.#texture.value(u, v, p);
   }
}

export { Lambertian as Diffuse, Metal, Dielectric, DiffusedLight };
