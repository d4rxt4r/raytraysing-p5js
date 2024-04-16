import { vec3 } from '../utils/vector.js';

export const BLACK_CLR = vec3(0, 0, 0);

class Texture {
   value() {
      return BLACK_CLR;
   }
}

class SolidColor extends Texture {
   constructor(...args) {
      super();

      if (!args.length === 1) {
         this._albedo = vec3(...args);
      }
      this._albedo = args[0];
   }

   value() {
      return this._albedo;
   }
}

class CheckerBoard extends Texture {
   constructor(scale, color1, color2) {
      super();

      this._invScale = 1 / scale;
      this._even = new SolidColor(color1);
      this._odd = new SolidColor(color2);
   }

   value(u, v, p) {
      const xInteger = Math.floor(this._invScale * p.x);
      const yInteger = Math.floor(this._invScale * p.y);
      const zInteger = Math.floor(this._invScale * p.z);

      const isEven = (xInteger + yInteger + zInteger) % 2 == 0;

      return isEven ? this._even.value(u, v, p) : this._odd.value(u, v, p);
   }
}

export { Texture, SolidColor, CheckerBoard };
