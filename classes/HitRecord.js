import { Vector } from '../utils/vector.js';

export default class HitRecord {
   p = null;
   normal = null;
   mat = null;
   frontFace = null;
   t = null;
   u = null;
   v = null;
   normal = null;

   setFaceNormal(ray, outwardNormal) {
      this.frontFace = Vector.dot(ray.direction, outwardNormal) < 0;
      this.normal = this.frontFace ? outwardNormal : Vector.scale(outwardNormal, -1);
   }
}
