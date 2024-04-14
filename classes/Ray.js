const { add: add3, mult: mul3 } = p5.Vector;

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
      return add3(this._origin, mul3(this._direction, t));
   }
}
