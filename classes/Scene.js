import { Vector, vec3 } from '../utils/vector.js';
import Ray from './Ray.js';
import Interval from './Interval.js';
import AABB from './AABB.js';

const { add, sub } = Vector;

class Hittable {
   hit(ray, rayT, hitRec) {
      throw new Error('Not implemented');
   }

   get boundingBox() {
      return this._boundingBox;
   }
}

class Translate extends Hittable {
   constructor(object, offset) {
      super();

      this._object = object;
      this._offset = offset;

      this._boundingBox = AABB.add(object.boundingBox, offset);
   }
   hit(ray, rayT, hitRec) {
      const offsetRay = new Ray(sub(ray.origin, this._offset), ray.direction);

      if (!this._object.hit(offsetRay, rayT, hitRec)) {
         return false;
      }

      hitRec.p = add(hitRec.p, this._offset);

      return true;
   }
}

class HittableList extends Hittable {
   constructor(object) {
      super();

      this.objects = [];
      this._boundingBox = new AABB(vec3(0, 0, 0), vec3(0, 0, 0));

      if (object) {
         this.add(object);
      }
   }

   add(object) {
      this.objects.push(object);
      this._boundingBox = new AABB(this.boundingBox, object.boundingBox);
   }

   clear() {
      this.objects = [];
   }

   hit(ray, rayT, hitRec) {
      let hitAnything = false;
      let closestObj = rayT.max;
      this.objects.forEach((object) => {
         if (object.hit(ray, new Interval(rayT.min, closestObj), hitRec)) {
            hitAnything = true;
            closestObj = hitRec.t;
         }
      });

      return hitAnything;
   }
}

export { Hittable, Translate, HittableList };
