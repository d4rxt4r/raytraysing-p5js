import { Vector } from 'utils/vector.js';
import Interval from 'classes/Interval.js';

export default class AABB {
   constructor(a, b, c) {
      if (a instanceof Vector && b instanceof Vector) {
         this.x = a.x <= b.x ? new Interval(a.x, b.x) : new Interval(b.x, a.x);
         this.y = a.y <= b.y ? new Interval(a.y, b.y) : new Interval(b.y, a.y);
         this.z = a.z <= b.z ? new Interval(a.z, b.z) : new Interval(b.z, a.z);

         return;
      }

      if (a instanceof AABB && b instanceof AABB) {
         this.x = new Interval(a.x, b.x);
         this.y = new Interval(a.y, b.y);
         this.z = new Interval(a.z, b.z);

         return;
      }

      this.x = a;
      this.y = b;
      this.z = c;
   }

   axisInterval(n) {
      if (n === 1) return this.y;
      if (n === 2) return this.z;
      return this.x;
   }

   hit(r, rayT) {
      const ray_orig = r.origin;
      const ray_dir = r.direction;

      for (let axis = 0; axis < 3; axis++) {
         const ax = this.axisInterval(axis);
         const adInv = 1 / ray_dir.axisVal(axis);

         const t0 = (ax.min - ray_orig.axisVal(axis)) * adInv;
         const t1 = (ax.max - ray_orig.axisVal(axis)) * adInv;

         if (t0 < t1) {
            if (t0 > rayT.min) rayT.min = t0;
            if (t1 < rayT.max) rayT.max = t1;
         } else {
            if (t1 > rayT.min) rayT.min = t1;
            if (t0 < rayT.max) rayT.max = t0;
         }

         if (rayT.max <= rayT.min) {
            return false;
         }
      }

      return true;
   }
}