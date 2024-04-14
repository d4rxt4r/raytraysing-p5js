import { Interval } from 'utils/math.js';

const { mult: mul3, dot: dot3 } = p5.Vector;

export class HitRecord {
   constructor({ point, normal, t } = {}) {
      this.p = point;
      this.normal = normal;
      this.t = t;
      this.mat = null;
   }

   setFaceNormal(ray, outward_normal) {
      this.frontFace = dot3(ray.direction, outward_normal) < 0;
      this.normal = this.frontFace ? outward_normal : mul3(outward_normal, -1);
   }
}

export class HittableList {
   constructor() {
      this.objects = [];
   }

   add(object) {
      this.objects.push(object);
   }

   clear() {
      this.objects = [];
   }

   hit(ray, rayT, hitRec) {
      const tempHRec = new HitRecord({});

      let hitAnything = false;
      let closestObj = rayT.max;
      this.objects.forEach((object) => {
         if (object.hit(ray, new Interval(rayT.min, closestObj), tempHRec)) {
            hitAnything = true;
            closestObj = tempHRec.t;

            hitRec.p = tempHRec.p;
            hitRec.normal = tempHRec.normal;
            hitRec.t = tempHRec.t;
            hitRec.mat = tempHRec.mat;
            hitRec.frontFace = tempHRec.frontFace;
         }
      });

      return hitAnything;
   }
}
