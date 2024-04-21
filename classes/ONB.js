import { Vector, vec3 } from '../utils/vector.js';

const { cross, normalize, scale } = Vector;

/**
 * Orthonormal Basis utility class
 */
export default class ONB {
   /**
    * @type {[Vector, Vector, Vector]}
    */
   axis;

   get u() {
      return this.axis[0];
   }
   get v() {
      return this.axis[1];
   }
   get w() {
      return this.axis[2];
   }

   axisVal(axis) {
      return this.axis[axis];
   }

   local(a, b, c) {
      if (a instanceof Vector) {
         return this.local(a.x, a.y, a.z);
      }

      return scale(this.u, a).add(scale(this.v, b)).add(scale(this.w, c));
   }

   buildFrom(w) {
      const unitW = normalize(w);
      const a = Math.abs(unitW.x) > 0.9 ? vec3(0, 1, 0) : vec3(1, 0, 0);
      const v = cross(unitW, a).normalize();
      const u = cross(unitW, v);

      this.axis = [u, v, unitW];
   }
}
