const { add: add3, sub: sub3, mult: mul3, normalize: normalize3, dot: dot3 } = p5.Vector;

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
   if (!min || !max) {
      return Math.random();
   }

   return min + (max - min) * Math.random();
}

function randomVec(min, max) {
   return createVector(randomDouble(min, max), randomDouble(min, max), randomDouble(min, max));
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
   return normalize3(randomInUnitSphere());
}

function randomOnHemisphere(normal) {
   const onUnitSphere = randomUnitVector();
   if (dot3(onUnitSphere, normal) > 0) {
      return onUnitSphere;
   }
   return mul3(onUnitSphere, -1);
}

function reflect(v, n) {
   return sub3(v, mul3(n, 2 * dot3(v, n)));
}

function refract(uv, n, etai_over_etat) {
   const cos_theta = Math.min(dot3(mul3(uv, -1), n), 1);
   const r_out_perp = mul3(add3(uv, mul3(n, cos_theta)), etai_over_etat);
   const r_out_parallel = mul3(n, -Math.sqrt(Math.abs(1.0 - r_out_perp.magSq())));
   return add3(r_out_perp, r_out_parallel);
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
