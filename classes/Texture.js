import { Vector, vec3 } from '../utils/vector.js';
import { int } from '../utils/math.js';
import { getPixelIndex } from '../utils/image.js';
import Perlin from './Perlin.js';
import Interval from './Interval.js';

export const BLACK_CLR = vec3(0, 0, 0);
export const CYAN_CLR = vec3(0, 1, 1);

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
      const xBlock = Math.floor(u * this._invScale);
      const yBlock = Math.floor(v * this._invScale);
      const isEven = (xBlock + yBlock) % 2 == 0;

      return isEven ? this._even.value(u, v, p) : this._odd.value(u, v, p);
   }
}

class ImageTexture extends Texture {
   constructor(image) {
      super();

      this._image = image;
   }

   value(u, v) {
      if (this._image.height <= 0) {
         return CYAN_CLR;
      }

      u = new Interval(0, 1).clamp(u);
      v = 1.0 - new Interval(0, 1).clamp(v); // Flip V to image coordinates

      const i = int(u * this._image.width);
      const j = int(v * this._image.height);
      const rIndex = getPixelIndex(i, j, this._image.width);
      const pixel = [this._image.pixels[rIndex], this._image.pixels[rIndex + 1], this._image.pixels[rIndex + 2]];

      const colorScale = 1.0 / 255;
      return vec3(colorScale * pixel[0], colorScale * pixel[1], colorScale * pixel[2]);
   }
}

class NoiseTexture extends Texture {
   $scale;
   $perlin;

   constructor(scale = 1) {
      super();

      this.$perlin = new Perlin();
      this.$scale = scale;
   }

   value(u, v, p) {
      return Vector.scale(vec3(0.5, 0.5, 0.5), 1 + this.$perlin.noise(Vector.scale(p, this.$scale)));
   }
}

class MarbleTexture extends NoiseTexture {
   constructor(scale) {
      super(scale);
   }

   value(u, v, p) {
      return Vector.scale(vec3(.5, .5, .5), 1 + Math.sin(this.$scale * p.z + 10 * this.$perlin.turb(p, 7)));
   }
}

export { Texture, SolidColor, CheckerBoard, ImageTexture, NoiseTexture, MarbleTexture };
