import { vec3 } from '../utils/vector.js';
import { Hittable } from './Objects.js';
import Interval from './Interval.js';
import AABB from './AABB.js';

export class HittableList extends Hittable {
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
