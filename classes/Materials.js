import { Vector, vec3 } from '../utils/vector.js';
import { Texture, SolidColor, BLACK_CLR } from './Texture.js';
import Ray from './Ray.js';

const { add, normalize, scale, dot, reflect, refract, nearZero } = Vector;

class Material {
   scatter() {
      return false;
   }

   emitted() {
      return BLACK_CLR;
   }
}

class Lambertian extends Material {
   constructor(arg) {
      super();
      if (arg instanceof Texture) {
         this._texture = arg;
         return;
      }

      this._texture = new SolidColor(arg);
   }

   scatter(rayIn, hitRec) {
      let scatterDirection = add(hitRec.normal, Vector.randomNorm());
      if (nearZero(scatterDirection)) {
         scatterDirection = rec.normal;
      }

      return {
         scatter: true,
         scattered: new Ray(hitRec.p, scatterDirection),
         attenuation: this._texture.value(hitRec.u, hitRec.v, hitRec.p)
      };
   }
}

class Metal extends Material {
   constructor(albedo, fuzz = 0) {
      super();
      this.albedo = albedo;
      this.fuzz = fuzz < 1 ? fuzz : 1;
   }

   scatter(rayIn, hitRec) {
      let reflected = reflect(rayIn.direction, hitRec.normal);
      if (this.fuzz) {
         reflected = normalize(reflected).add(scale(Vector.randomNorm(), this.fuzz));
      }
      const scattered = new Ray(hitRec.p, reflected);

      return {
         scatter: dot(scattered.direction, hitRec.normal) > 0,
         scattered,
         attenuation: this.albedo
      };
   }
}

class Dielectric extends Material {
   constructor(refIndex) {
      super();
      this.refIndex = refIndex;
   }

   reflectance(cosine, ri) {
      let r0 = (1 - ri) / (1 + ri);
      r0 *= r0;
      return r0 + (1 - r0) * Math.pow(1 - cosine, 5);
   }

   scatter(rayIn, hitRec) {
      const ri = hitRec.frontFace ? 1 / this.refIndex : this.refIndex;
      const unitDirection = normalize(rayIn.direction);

      const cos_theta = Math.min(dot(scale(unitDirection, -1), hitRec.normal), 1);
      const sin_theta = Math.sqrt(1 - cos_theta * cos_theta);

      const cannot_refract = ri * sin_theta > 1;
      let direction;
      if (cannot_refract || this.reflectance(cos_theta, ri) > Math.random()) {
         direction = reflect(unitDirection, hitRec.normal);
      } else {
         direction = refract(unitDirection, hitRec.normal, ri);
      }

      return {
         scatter: true,
         scattered: new Ray(hitRec.p, direction),
         attenuation: vec3(1, 1, 1)
      };
   }
}

class DiffusedLight extends Material {
   constructor(arg) {
      super();

      if (arg instanceof Texture) {
         this._texture = arg;
         return;
      }

      this._texture = new SolidColor(arg);
   }

   emitted(hitRec, u, v, p) {
      if (!hitRec.frontFace) {
         return BLACK_CLR;
      }
      return this._texture.value(u, v, p);
   }
}

export { Lambertian as Diffuse, Metal, Dielectric, DiffusedLight };
