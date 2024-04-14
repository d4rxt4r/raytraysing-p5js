import { vec3, Vector } from 'utils/vector.js';
import { Lambertian } from 'classes/Material.js';

const { sub, scale, dot } = Vector;

export class Hittable {
   hit(ray, rayT, hitRec) {
      throw new Error('Not implemented');
   }
}

class Sphere extends Hittable {
   constructor(center, radius, mat) {
      super();
      this.center = center;
      this.radius = radius || 0;
      this.mat = mat || new Lambertian(vec3(1, 1, 1));
   }

   hit(ray, rayT, hitRec) {
      const oc = sub(this.center, ray.origin);
      const a = ray.direction.magSq();
      const h = dot(ray.direction, oc);
      const c = oc.magSq() - this.radius * this.radius;

      const discriminant = h * h - a * c;

      if (discriminant < 0) {
         return false;
      }

      const sqrtD = Math.sqrt(discriminant);
      let root = (h - sqrtD) / a;
      if (!rayT.surrounds(root)) {
         root = (h + sqrtD) / a;
         if (!rayT.surrounds(root)) {
            return false;
         }
      }

      hitRec.t = root;
      hitRec.p = ray.at(hitRec.t);
      const outward_normal = scale(sub(hitRec.p, this.center), 1 / this.radius);
      hitRec.setFaceNormal(ray, outward_normal);
      hitRec.mat = this.mat;

      return true;
   }
}

export { Sphere };
