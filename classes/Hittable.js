import { randomInt } from '../utils/math.js';
import { vec3 } from '../utils/vector.js';
import Interval from './Interval.js';
import AABB from './AABB.js';

class Hittable {
   /**
    * @type {AABB}
    */
   $boundingBox = new AABB();

   get boundingBox() {
      return this.$boundingBox;
   }

   hit(ray, rayInt, hitRec) {
      throw new Error('Not implemented');
   }

   pdfValue(origin, direction) {
      return 0;
   }

   random(origin) {
      return vec3(1, 0, 0);
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

   pdfValue(origin, direction) {
      const weight = 1 / this.objects.length;
      const sum = this.objects.reduce((acc, cur) => acc + weight * cur.pdfValue(origin, direction), 0);

      return sum;
   }

   random(origin) {
      return this.objects[randomInt(0, this.objects.length - 1)].random(origin);
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
