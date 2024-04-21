import { Vector, vec3 } from '../utils/vector.js';
import { color } from '../utils/image.js';
import { Diffuse, Isotropic } from './Materials.js';
import { Hittable, HittableList } from './Hittable.js';
import HitRecord from './HitRecord.js';
import Interval from './Interval.js';
import AABB from './AABB.js';
import Ray from './Ray.js';
import ONB from './ONB.js';

const { add, sub, scale, dot, cross, normalize } = Vector;

const DiT = new Interval(0.001, Infinity);

class Sphere extends Hittable {
   #center;
   #radius;
   #mat;
   #isMoving;
   #centerVec;

   constructor(center, radius, mat, centerOffset) {
      super();

      this.#center = center;
      this.#radius = radius || 0;
      this.#mat = mat || new Diffuse(color(1, 1, 1));

      const rVec = vec3(radius, radius, radius);

      if (centerOffset instanceof Vector) {
         this.#isMoving = true;
         this.#centerVec = sub(centerOffset, center);
         this.$boundingBox = new AABB(
            new AABB(sub(center, rVec), add(center, rVec)),
            new AABB(sub(centerOffset, rVec), add(centerOffset, rVec))
         );
      } else {
         this.$boundingBox = new AABB(sub(this.#center, rVec), add(this.#center, rVec));
      }
   }

   #getSphereUV(p) {
      const theta = Math.acos(-p.y);
      const phi = Math.atan2(-p.z, p.x) + Math.PI;

      return {
         u: phi / (2 * Math.PI),
         v: theta / Math.PI
      };
   }

   #sphereCenter(time) {
      return scale(this.#centerVec, time).add(this.#center);
   }

   pdfValue(origin, direction) {
      // This method only works for stationary spheres.
      const hRec = new HitRecord();
      if (!this.hit(new Ray(origin, direction), DiT, hRec)) {
         return 0;
      }

      const cosThetaMax = Math.sqrt(1 - (this.#radius * this.#radius) / sub(this.#center, origin).magSq());
      const solidAngle = 2 * Math.PI * (1 - cosThetaMax);
      return 1 / solidAngle;
   }

   random(origin) {
      const direction = sub(this.#center, origin);
      const distSq = direction.magSq();
      const uvw = new ONB();
      uvw.buildFrom(direction);

      return uvw.local(Sphere.randomToSphere(this.#radius, distSq));
   }

   hit(ray, rayInt, hitRec) {
      const center = this.#isMoving ? this.#sphereCenter(ray.time) : this.#center;
      const oc = sub(center, ray.origin);
      const a = ray.direction.magSq();
      const h = dot(ray.direction, oc);
      const c = oc.magSq() - this.#radius * this.#radius;

      const discriminant = h * h - a * c;

      if (discriminant < 0) {
         return false;
      }

      const sqrtD = Math.sqrt(discriminant);
      let root = (h - sqrtD) / a;
      if (!rayInt.surrounds(root)) {
         root = (h + sqrtD) / a;
         if (!rayInt.surrounds(root)) {
            return false;
         }
      }

      hitRec.t = root;
      hitRec.p = ray.at(hitRec.t);
      const outward_normal = scale(sub(hitRec.p, this.#center), 1 / this.#radius);
      hitRec.setFaceNormal(ray, outward_normal);
      const { u, v } = this.#getSphereUV(outward_normal);
      hitRec.u = u;
      hitRec.v = v;
      hitRec.mat = this.#mat;

      return true;
   }

   static randomToSphere(radius, distSq) {
      const r1 = Math.random();
      const r2 = Math.random();
      const z = 1 + r2 * (Math.sqrt(1 - (radius * radius) / distSq) - 1);

      const phi = 2 * Math.PI * r1;
      const x = Math.cos(phi) * Math.sqrt(1 - z * z);
      const y = Math.sin(phi) * Math.sqrt(1 - z * z);

      return vec3(x, y, z);
   }
}

class Quad extends Hittable {
   /**
    * @type {Vector}
    */
   #Q;
   /**
    * @type {Vector}
    */
   #u;
   /**
    * @type {Vector}
    */
   #v;
   /**
    * @type {Vector}
    */
   #w;
   /**
    * @type {Vector}
    */
   #normal;
   /**
    * @type {number}
    */
   #D;
   /**
    * @type {number}
    */
   #area;
   #mat;

   constructor(Q, u, v, mat) {
      super();

      this.#Q = Q;
      this.#u = u;
      this.#v = v;
      this.#mat = mat;

      const n = cross(u, v);
      this.#normal = normalize(n);
      this.#D = dot(this.#normal, Q);
      this.#w = scale(n, 1 / dot(n, n));
      this.#area = n.mag();

      this.#setBoundingBox();
   }

   #setBoundingBox() {
      const bBoxDiagonal1 = new AABB(this.#Q, add(this.#Q, this.#u).add(this.#v));
      const bBoxDiagonal2 = new AABB(add(this.#Q, this.#u), add(this.#Q, this.#v));
      this.$boundingBox = new AABB(bBoxDiagonal1, bBoxDiagonal2);
   }

   pdfValue(origin, direction) {
      const hRec = new HitRecord();
      if (!this.hit(new Ray(origin, direction), DiT, hRec)) {
         return 0;
      }

      const distSq = hRec.t * hRec.t * direction.magSq();
      const cosine = Math.abs(dot(direction, hRec.normal) / direction.mag());

      return distSq / (cosine * this.#area);
   }

   random(origin) {
      const p = this.#Q.copy().add(scale(this.#u, Math.random())).add(scale(this.#v, Math.random()));
      return p.sub(origin);
   }

   isInterior(a, b, hitRec) {
      const unitInterval = new Interval(0, 1);
      if (!unitInterval.contains(a) || !unitInterval.contains(b)) {
         return false;
      }

      hitRec.u = a;
      hitRec.v = b;

      return true;
   }

   hit(ray, rayInt, hitRec) {
      const denom = dot(this.#normal, ray.direction);

      if (Math.abs(denom) < 1e-8) {
         return false;
      }

      const t = (this.#D - dot(this.#normal, ray.origin)) / denom;
      if (!rayInt.contains(t)) {
         return false;
      }

      const intersection = ray.at(t);
      const planarHitPT = sub(intersection, this.#Q);

      const alpha = dot(this.#w, cross(planarHitPT, this.#v));
      const beta = dot(this.#w, cross(this.#u, planarHitPT));

      if (!this.isInterior(alpha, beta, hitRec)) {
         return false;
      }

      hitRec.t = t;
      hitRec.p = intersection;
      hitRec.mat = this.#mat;
      hitRec.setFaceNormal(ray, this.#normal);

      return true;
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

class ConstantMedium extends Hittable {
   #boundary;
   #negInvDensity;
   #phaseFunction;

   constructor(boundary, density, tex) {
      super();

      this.#boundary = boundary;
      this.#negInvDensity = -1 / density;
      this.#phaseFunction = new Isotropic(tex);
   }

   get boundingBox() {
      return this.#boundary.boundingBox;
   }

   hit(ray, rayInt, hitRec) {
      const rec1 = new HitRecord();
      const rec2 = new HitRecord();

      if (!this.#boundary.hit(ray, Interval.universe(), rec1)) {
         return false;
      }

      if (!this.#boundary.hit(ray, new Interval(rec1.t + 0.0001, Infinity), rec2)) {
         return false;
      }

      if (rec1.t < rayInt.min) {
         rec1.t = rayInt.min;
      }

      if (rec2.t > rayInt.max) {
         rec2.t = rayInt.max;
      }

      if (rec1.t >= rec2.t) {
         return false;
      }

      if (rec1.t < 0) {
         rec1.t = 0;
      }

      const rayLength = ray.direction.mag();
      const distanceInsideBoundary = (rec2.t - rec1.t) * rayLength;
      const hitDistance = this.#negInvDensity * Math.log(Math.random());

      if (hitDistance > distanceInsideBoundary) {
         return false;
      }

      hitRec.t = rec1.t + hitDistance / rayLength;
      hitRec.p = ray.at(hitRec.t);
      hitRec.normal = vec3(1, 0, 0);
      hitRec.frontFace = true;
      hitRec.mat = this.#phaseFunction;

      return true;
   }
}

export { Sphere, Quad, Box, ConstantMedium };
