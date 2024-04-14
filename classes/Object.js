import { int, randomInt } from 'utils/math.js';
import { Vector, vec3 } from 'utils/vector.js';
import { FlatColor } from 'classes/Material.js';
import Interval from 'classes/Interval.js';
import AABB from 'classes/AABB.js';

const { add, sub, scale, dot } = Vector;

export class Hittable {
   hit(ray, rayT, hitRec) {
      throw new Error('Not implemented');
   }

   get boundingBox() {
      return this._boundingBox;
   }
}

export class BHVNode extends Hittable {
   constructor(objects, start, end) {
      super();
      const axis = randomInt(0, 2);
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

      this._boundingBox = new AABB(this.left.boundingBox, this.right.boundingBox);
   }

   hit(ray, rayT, hitRec) {
      if (!this._boundingBox.hit(ray, rayT)) {
         return false;
      }

      const rT = new Interval(rayT);
      const hitLeft = this.left.hit(ray, rayT, hitRec);
      const hitRight = this.right.hit(ray, new Interval(rT.min, hitLeft ? hitRec.t : rT.max), hitRec);

      return hitLeft || hitRight;
   }

   static boxCompare(a, b, axisIndex) {
      const a_axis_interval = a.boundingBox.axisInterval(axisIndex);
      const b_axis_interval = b.boundingBox.axisInterval(axisIndex);
      return a_axis_interval.min - b_axis_interval.min;
   }
}

class Sphere extends Hittable {
   constructor(center, radius, mat) {
      super();
      this.center = center;
      this.radius = radius || 0;
      this.mat = mat || new FlatColor(vec3(1, 1, 1));

      const rVec = vec3(radius, radius, radius);
      this._boundingBox = new AABB(sub(this.center, rVec), add(this.center, rVec));
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
