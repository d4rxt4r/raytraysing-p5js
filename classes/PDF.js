import { Vector, vec3, randomCosineDirection } from '../utils/vector.js';
import { HittableList } from './Hittable.js';
import ONB from './ONB.js';

const { dot, normalize } = Vector;

export default class PDF {
   /**
    * @param {Vector} direction
    */
   value(direction) {
      return 0;
   }

   generate() {
      return vec3(0, 0, 0);
   }
}

class SpherePDF extends PDF {
   value() {
      return 1 / (4 * Math.PI);
   }

   generate() {
      return Vector.randomNorm();
   }
}

class CosinePDF extends PDF {
   /**
    * @type {ONB}
    */
   #uvw = new ONB();

   constructor(w) {
      super();

      this.#uvw.buildFrom(w);
   }

   value(direction) {
      const cosine = dot(normalize(direction), this.#uvw.w);
      return Math.max(0, cosine / Math.PI);
   }

   generate() {
      return this.#uvw.local(randomCosineDirection());
   }
}

class HittablePDF extends PDF {
   #objects;
   #origin;

   /**
    * @param {HittableList} objects
    * @param {Vector} origin
    */
   constructor(objects, origin) {
      super();

      this.#objects = objects;
      this.#origin = origin;
   }

   value(direction) {
      return this.#objects.pdfValue(this.#origin, direction);
   }

   generate() {
      return this.#objects.random(this.#origin);
   }
}

class MixturePDF extends PDF {
   /**
    * @type {[PDF, PDF]}
    */
   #pdf;

   constructor(p0, p1) {
      super();

      this.#pdf = [p0, p1];
   }

   value(direction) {
      if (this.#pdf[1] == null) {
         console.log(this.#pdf[1]);
      }
      return this.#pdf[0].value(direction) + 0.5 * this.#pdf[1].value(direction);
   }

   generate() {
      const n = Number(Math.random() < 0.5);
      if (this.#pdf[n] == null) {
         console.log(this.#pdf);
      }
      return this.#pdf[n].generate();
   }
}

export { SpherePDF, CosinePDF, HittablePDF, MixturePDF };
