import { Vector } from '../utils/vector.js';
import Interval from './Interval.js';

const DELTA = 0.001;

export default class AABB {
   constructor(...args) {
      if (args[0] instanceof Vector && args[1] instanceof Vector) {
         this.x = Interval.minmax(args[0].x, args[1].x);
         this.y = Interval.minmax(args[0].y, args[1].y);
         this.z = Interval.minmax(args[0].z, args[1].z);
         return this.#padToMinimums();
      }

      if (args[0] instanceof AABB && args[1] instanceof AABB) {
         this.x = new Interval(args[0].x, args[1].x);
         this.y = new Interval(args[0].y, args[1].y);
         this.z = new Interval(args[0].z, args[1].z);
         return this.#padToMinimums();
      }

      this.x = args[0];
      this.y = args[1];
      this.z = args[2];

      this.#padToMinimums();
   }

   #padToMinimums() {
      if (this.x.size < DELTA) this.x.expand(DELTA);
      if (this.y.size < DELTA) this.y.expand(DELTA);
      if (this.z.size < DELTA) this.z.expand(DELTA);
   }

   axisInterval(n) {
      if (n === 1) return this.y;
      if (n === 2) return this.z;
      return this.x;
   }

   longestAxis() {
      if (this.x.size > this.y.size) {
         return this.x.size > this.z.size ? 0 : 2;
      }

      return this.y.size > this.z.size ? 1 : 2;
   }

   hit(ray, rayInt) {
      const rayOrig = ray.origin;
      const rayDir = ray.direction;

      for (let axis = 0; axis < 3; axis++) {
         const ax = this.axisInterval(axis);
         const adInv = 1 / rayDir.axisVal(axis);

         const t0 = (ax.min - rayOrig.axisVal(axis)) * adInv;
         const t1 = (ax.max - rayOrig.axisVal(axis)) * adInv;

         if (t0 < t1) {
            if (t0 > rayInt.min) rayInt.min = t0;
            if (t1 < rayInt.max) rayInt.max = t1;
         } else {
            if (t1 > rayInt.min) rayInt.min = t1;
            if (t0 < rayInt.max) rayInt.max = t0;
         }

         if (rayInt.max <= rayInt.min) {
            return false;
         }
      }

      return true;
   }

   static add(bBox, offset) {
      return new AABB(Interval.add(bBox.x, offset.x), Interval.add(bBox.y, offset.y), Interval.add(bBox.z, offset.z));
   }
}
