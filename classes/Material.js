import { reflect, nearZero, randomUnitVector, refract, randomDouble } from 'utils/math.js';
import { vec3, Vector } from 'utils/vector.js';
import Ray from 'classes/Ray.js';

const { add, mul, normalize, scale, dot } = Vector;

class Material {
   scatter(rayIn, hitRec, attenuation, scattered) {
      return false;
   }
}

class Lambertian extends Material {
   constructor(albedo) {
      super();
      this.albedo = albedo;
   }

   scatter(rayIn, hitRec) {
      let scatterDirection = add(hitRec.normal, randomUnitVector());
      if (nearZero(scatterDirection)) {
         scatterDirection = rec.normal;
      }

      return {
         scatter: true,
         scattered: new Ray(hitRec.p, scatterDirection),
         attenuation: this.albedo
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
         reflected = normalize(reflected).add(scale(randomUnitVector(), this.fuzz));
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
      this.refIdx = refIndex;
   }

   reflectance(cosine, ri) {
      let r0 = (1 - ri) / (1 + ri);
      r0 *= r0;
      return r0 + (1 - r0) * Math.pow(1 - cosine, 5);
   }

   scatter(rayIn, hitRec) {
      const ri = hitRec.frontFace ? 1 / this.refIdx : this.refIdx;
      const unitDirection = normalize(rayIn.direction);

      const cos_theta = Math.min(dot(scale(unitDirection, -1), hitRec.normal), 1);
      const sin_theta = Math.sqrt(1 - cos_theta * cos_theta);

      const cannot_refract = ri * sin_theta > 1;
      let direction;
      if (cannot_refract || this.reflectance(cos_theta, ri) > randomDouble()) {
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

export { Lambertian, Metal, Dielectric };
