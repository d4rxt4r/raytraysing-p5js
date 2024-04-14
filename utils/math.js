import { vec3, Vector } from 'utils/vector.js';

const { add, sub, mul, scale, normalize, dot } = Vector;

export class Interval {
   constructor(min = -Infinity, max = Infinity) {
      this.min = min;
      this.max = max;
   }

   get size() {
      return this.max - this.min;
   }

   contains(x) {
      return this.min <= x && x <= this.max;
   }

   surrounds(x) {
      return x > this.min && x < this.max;
   }

   clamp(x) {
      if (x < this.min) return this.min;
      if (x > this.max) return this.max;
      return x;
   }
}

function int(float) {
   if (float === Number.POSITIVE_INFINITY) {
      return 1;
   }
   if (float === Number.NEGATIVE_INFINITY) {
      return -1;
   }

   return Math.trunc(float);
}

function deg2rad(degrees) {
   return (degrees * Math.PI) / 180;
}

const S = 1e-8;
function nearZero(vec) {
   return Math.abs(vec.x) < S && Math.abs(vec.y) < S && Math.abs(vec.z) < S;
}

function randomDouble(min, max) {
   if (min == null || max == null) {
      return Math.random();
   }

   return min + (max - min) * Math.random();
}

function randomVec(min, max) {
   if (min == null || max == null) {
      return vec3(Math.random(), Math.random(), Math.random());
   }

   return vec3(randomDouble(min, max), randomDouble(min, max), randomDouble(min, max));
}

function randomInUnitSphere() {
   while (true) {
      const p = randomVec(-1, 1);
      if (p.magSq() < 1) {
         return p;
      }
   }
}

function randomUnitVector() {
   return normalize(randomInUnitSphere());
}

function randomOnHemisphere(normal) {
   const onUnitSphere = randomUnitVector();
   if (dot(onUnitSphere, normal) > 0) {
      return onUnitSphere;
   }
   return mul(onUnitSphere, -1);
}

function reflect(v, n) {
   return sub(v, scale(n, 2 * dot(v, n)));
}

function refract(uv, n, etai_over_etat) {
   const cos_theta = Math.min(dot(scale(uv, -1), n), 1);
   const r_out_perp = scale(add(uv, scale(n, cos_theta)), etai_over_etat);
   const r_out_parallel = scale(n, -Math.sqrt(Math.abs(1.0 - r_out_perp.magSq())));
   return add(r_out_perp, r_out_parallel);
}

export {
   int,
   deg2rad,
   nearZero,
   reflect,
   refract,
   randomDouble,
   randomVec,
   randomInUnitSphere,
   randomUnitVector,
   randomOnHemisphere
};
