import { Vector, vec3 } from '../utils/vector.js';
import Ray from './Ray.js';
import Interval from './Interval.js';
import AABB from './AABB.js';

class Hittable {
   /**
    * @type {AABB}
    */
   $boundingBox;

   hit(ray, rayInt, hitRec) {
      throw new Error('Not implemented');
   }

   get boundingBox() {
      return this.$boundingBox;
   }
}

class HittableList extends Hittable {
   constructor(object) {
      super();

      this.objects = [];
      this.$boundingBox = new AABB(vec3(0, 0, 0), vec3(0, 0, 0));

      if (object) {
         this.add(object);
      }
   }

   add(object) {
      this.objects.push(object);
      this.$boundingBox = new AABB(this.boundingBox, object.boundingBox);
   }

   clear() {
      this.objects = [];
   }

   hit(ray, rayInt, hitRec) {
      let hitAnything = false;
      let closestObj = rayInt.max;
      this.objects.forEach((object) => {
         if (object.hit(ray, new Interval(rayInt.min, closestObj), hitRec)) {
            hitAnything = true;
            closestObj = hitRec.t;
         }
      });

      return hitAnything;
   }
}

export { Hittable, HittableList };
