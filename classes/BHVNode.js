import { vec3 } from '../utils/vector.js';
import { int } from '../utils/math.js';
import { Hittable } from './Hittable.js';
import Interval from './Interval.js';
import AABB from './AABB.js';

export default class BHVNode extends Hittable {
   constructor(objects, start, end) {
      super();

      this.$boundingBox = new AABB(vec3(0, 0, 0), vec3(0, 0, 0));
      for (let object_index = start; object_index < end; object_index++) {
         this.$boundingBox = new AABB(this.$boundingBox, objects[object_index].boundingBox);
      }

      const axis = this.$boundingBox.longestAxis();
      const object_span = end - start;

      if (object_span == 1) {
         this.left = this.right = objects[start];
      } else if (object_span == 2) {
         this.left = objects[start];
         this.right = objects[start + 1];
      } else {
         const sortedArray = objects.slice(start, end);
         sortedArray.sort((a, b) => BHVNode.boxCompare(a, b, axis));
         for (let i = start; i < end; i++) {
            objects[i] = sortedArray[i - start];
         }

         const mid = int(start + object_span / 2);
         this.left = new BHVNode(objects, start, mid);
         this.right = new BHVNode(objects, mid, end);
      }
   }

   hit(ray, rayInt, hitRec) {
      if (!this.$boundingBox.hit(ray, rayInt)) {
         return false;
      }

      const rT = new Interval(rayInt);
      const hitLeft = this.left.hit(ray, rayInt, hitRec);
      const hitRight = this.right.hit(ray, new Interval(rT.min, hitLeft ? hitRec.t : rT.max), hitRec);

      return hitLeft || hitRight;
   }

   static boxCompare(a, b, axisIndex) {
      const a_axis_interval = a.boundingBox.axisInterval(axisIndex);
      const b_axis_interval = b.boundingBox.axisInterval(axisIndex);
      return a_axis_interval.min - b_axis_interval.min;
   }
}
