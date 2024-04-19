import { Vector } from '../utils/vector.js';

export default class HitRecord {
   p;
   normal;
   mat;
   frontFace;
   t;
   u;
   v;
   normal;

   setFaceNormal(ray, outwardNormal) {
      this.frontFace = Vector.dot(ray.direction, outwardNormal) < 0;
      this.normal = this.frontFace ? outwardNormal : Vector.scale(outwardNormal, -1);
   }
}
