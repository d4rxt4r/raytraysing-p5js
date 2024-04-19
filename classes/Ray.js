import { Vector } from '../utils/vector.js';

/**
 * Represents a Ray in 3D space.
 */
export default class Ray {
   /**
    * The origin of the Ray.
    * @type {Vector}
    * @private
    */
   #origin;

   /**
    * The direction of the Ray.
    * @type {Vector}
    * @private
    */
   #direction;

   /**
    * The time of the Ray.
    * @type {number}
    */
   #time;

   /**
    * Creates a Ray.
    * @param {Vector} origin - The origin of the Ray.
    * @param {Vector} direction - The direction of the Ray.
    */
   constructor(origin, direction, time) {
      this.#origin = origin;
      this.#direction = direction;
      this.#time = time;
   }

   /**
    * Gets the origin of the Ray.
    * @return {Vector} The origin of the Ray.
    */
   get origin() {
      return this.#origin;
   }

   /**
    * Gets the direction of the Ray.
    * @return {Vector} The direction of the Ray.
    */
   get direction() {
      return this.#direction;
   }

   get time() {
      return this.#time;
   }

   /**
    * Calculates the point at a given position.
    * @param {number} t - The position.
    * @return {Vector} The point at position.
    */
   at(t) {
      return Vector.scale(this.#direction, t).add(this.#origin);
   }
}
