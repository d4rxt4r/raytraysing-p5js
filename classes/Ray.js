import { Vector } from '../utils/vector.js';

const { add, scale } = Vector;

export default class Ray {
   constructor(origin, direction) {
      this._origin = origin;
      this._direction = direction;
   }

   get origin() {
      return this._origin;
   }

   get direction() {
      return this._direction;
   }

   at(t) {
      return add(this._origin, scale(this._direction, t));
   }
}
