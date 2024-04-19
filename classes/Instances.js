import { deg2rad } from '../utils/math.js';
import { Vector, vec3, point3 } from '../utils/vector.js';
import { Hittable } from './Hittable.js';
import AABB from './AABB.js';
import Ray from './Ray.js';
import HitRecord from './HitRecord.js';

class Translate extends Hittable {
   #object;
   #offset;

   constructor(object, offset) {
      super();

      this.#object = object;
      this.#offset = offset;

      this.$boundingBox = AABB.add(object.boundingBox, offset);
   }

   hit(ray, rayInt, hitRec) {
      const offsetRay = new Ray(Vector.sub(ray.origin, this.#offset, ray.time), ray.direction, ray.time);

      if (!this.#object.hit(offsetRay, rayInt, hitRec)) {
         return false;
      }

      hitRec.p = Vector.add(hitRec.p, this.#offset);

      return true;
   }
}

class RotateY extends Hittable {
   #object;
   #sinTheta;
   #cosTheta;

   constructor(object, angle) {
      super();

      this.#object = object;

      const radians = deg2rad(angle);
      this.#sinTheta = Math.sin(radians);
      this.#cosTheta = Math.cos(radians);

      const bBox = object.boundingBox;

      const min = point3(Infinity, Infinity, Infinity);
      const max = point3(-Infinity, -Infinity, -Infinity);

      for (let i = 0; i < 2; i++) {
         for (let j = 0; j < 2; j++) {
            for (let k = 0; k < 2; k++) {
               const x = i * bBox.x.max + (1 - i) * bBox.x.min;
               const y = j * bBox.y.max + (1 - j) * bBox.y.min;
               const z = k * bBox.z.max + (1 - k) * bBox.z.min;

               const newX = this.#cosTheta * x + this.#sinTheta * z;
               const newZ = -this.#sinTheta * x + this.#cosTheta * z;
               const tester = vec3(newX, y, newZ);

               min.x = Math.min(min.x, tester.x);
               max.x = Math.max(max.x, tester.x);

               min.y = Math.min(min.y, tester.y);
               max.y = Math.max(max.y, tester.y);

               min.z = Math.min(min.z, tester.z);
               max.z = Math.max(max.z, tester.z);
            }
         }
      }

      this.$boundingBox = new AABB(min, max);
   }

   hit(ray, rayInt, hitRec) {
      const origin = ray.origin.copy();
      const direction = ray.direction.copy();

      origin.x = this.#cosTheta * ray.origin.x - this.#sinTheta * ray.origin.z;
      origin.z = this.#sinTheta * ray.origin.x + this.#cosTheta * ray.origin.z;

      direction.x = this.#cosTheta * ray.direction.x - this.#sinTheta * ray.direction.z;
      direction.z = this.#sinTheta * ray.direction.x + this.#cosTheta * ray.direction.z;

      const rotatedRay = new Ray(origin, direction, ray.time);

      if (!this.#object.hit(rotatedRay, rayInt, hitRec)) {
         return false;
      }

      const p = hitRec.p.copy();
      p.x = this.#cosTheta * hitRec.p.x + this.#sinTheta * hitRec.p.z;
      p.z = -this.#sinTheta * hitRec.p.x + this.#cosTheta * hitRec.p.z;

      const normal = hitRec.normal.copy();
      normal.x = this.#cosTheta * hitRec.normal.x + this.#sinTheta * hitRec.normal.z;
      normal.z = -this.#sinTheta * hitRec.normal.x + this.#cosTheta * hitRec.normal.z;

      hitRec.p = p;
      hitRec.normal = normal;

      return true;
   }
}

export { Translate, RotateY };
