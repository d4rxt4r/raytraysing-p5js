import { int } from '../utils/math.js';
import { Vector, vec3 } from '../utils/vector.js';
import { color } from '../utils/image.js';
import { Diffuse } from './Materials.js';
import { Hittable, HittableList } from './Scene.js';
import Interval from './Interval.js';
import AABB from './AABB.js';

const { add, sub, scale, dot, cross, normalize } = Vector;

const EMPTY_BBOX = new AABB(vec3(0, 0, 0), vec3(0, 0, 0));

export class BHVNode extends Hittable {
   constructor(objects, start, end) {
      super();

      this.$boundingBox = EMPTY_BBOX;
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

   hit(ray, rayT, hitRec) {
      if (!this.$boundingBox.hit(ray, rayT)) {
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

export class Quad extends Hittable {
   constructor(Q, u, v, mat) {
      super();

      this._Q = Q;
      this._u = u;
      this._v = v;
      this._mat = mat;

      const n = cross(u, v);
      this._normal = normalize(n);
      this._D = dot(this._normal, Q);
      this._w = scale(n, 1 / dot(n, n));

      this.setBoundingBox();
   }

   setBoundingBox() {
      const bBoxDiagonal1 = new AABB(this._Q, add(add(this._Q, this._u), this._v));
      const bBoxDiagonal2 = new AABB(add(this._Q, this._u), add(this._Q, this._v));
      this.$boundingBox = new AABB(bBoxDiagonal1, bBoxDiagonal2);
   }

   isInterior(a, b, hitRec) {
      const unitInterval = new Interval(0, 1);
      if (!unitInterval.contains(a) || !unitInterval.contains(b)) return false;

      hitRec.u = a;
      hitRec.v = b;

      return true;
   }

   hit(ray, rayT, hitRec) {
      const denom = dot(this._normal, ray.direction);

      // No hit if the ray is parallel to the plane.
      if (Math.abs(denom) < 1e-8) return false;

      const t = (this._D - dot(this._normal, ray.origin)) / denom;
      if (!rayT.contains(t)) return false;

      const intersection = ray.at(t);
      const planarHitPT = sub(intersection, this._Q);

      const alpha = dot(this._w, cross(planarHitPT, this._v));
      const beta = dot(this._w, cross(this._u, planarHitPT));

      if (!this.isInterior(alpha, beta, hitRec)) return false;

      hitRec.t = t;
      hitRec.p = intersection;
      hitRec.mat = this._mat;
      hitRec.setFaceNormal(ray, this._normal);

      return true;
   }
}

class Sphere extends Hittable {
   constructor(center, radius, mat) {
      super();
      this.center = center;
      this.radius = radius || 0;
      this.mat = mat || new Diffuse(color(1, 1, 1));

      const rVec = vec3(radius, radius, radius);
      this.$boundingBox = new AABB(sub(this.center, rVec), add(this.center, rVec));
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
      const { u, v } = this.getSphereUV(outward_normal);
      hitRec.u = u;
      hitRec.v = v;
      hitRec.mat = this.mat;

      return true;
   }

   getSphereUV(p) {
      const theta = Math.acos(-p.y);
      const phi = Math.atan2(-p.z, p.x) + Math.PI;

      return {
         u: phi / (2 * Math.PI),
         v: theta / Math.PI
      };
   }
}

class Box extends HittableList {
   constructor(a, b, mat) {
      super();

      // Construct the two opposite vertices with the minimum and maximum coordinates.
      const min = vec3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
      const max = vec3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));

      const dx = vec3(max.x - min.x, 0, 0);
      const dy = vec3(0, max.y - min.y, 0);
      const dz = vec3(0, 0, max.z - min.z);

      this.add(new Quad(vec3(min.x, min.y, max.z), dx, dy, mat)); // front
      this.add(new Quad(vec3(max.x, min.y, max.z), scale(dz, -1), dy, mat)); // right
      this.add(new Quad(vec3(max.x, min.y, min.z), scale(dx, -1), dy, mat)); // back
      this.add(new Quad(vec3(min.x, min.y, min.z), dz, dy, mat)); // left
      this.add(new Quad(vec3(min.x, max.y, max.z), dx, scale(dz, -1), mat)); // top
      this.add(new Quad(vec3(min.x, min.y, min.z), dx, dz, mat)); // bottom
   }
}

export { Sphere, Box };
