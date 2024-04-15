import { randomDouble } from './math.js';

const EPS = 1e-8;

class Vector {
   constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
   }

   copy() {
      return Vector.copy(this);
   }

   add(vec) {
      return Vector.add(this, vec);
   }

   sub(vec) {
      return Vector.sub(this, vec);
   }

   mul(vec) {
      return Vector.mul(this, vec);
   }

   scale(s) {
      return Vector.scale(this, s);
   }

   div(vec) {
      return Vector.div(this, vec);
   }

   mag() {
      return Vector.mag(this);
   }

   magSq() {
      return Vector.magSq(this);
   }

   normalize() {
      return Vector.normalize(this);
   }

   dot(vec) {
      return Vector.dot(this, vec);
   }

   cross(vec) {
      return Vector.cross(this, vec);
   }

   axisVal(axis) {
      if (axis === 1) {
         return this.y;
      }
      if (axis === 2) {
         return this.z;
      }
      return this.x;
   }

   static checkInputs(...values) {
      values.forEach((value) => {
         if (!value instanceof Vector) {
            throw new Error('Wrong type!');
         }

         if (isNaN(value.x) || isNaN(value.y) || isNaN(value.z)) {
            throw new Error('NaN values provided!');
         }
      });
   }

   static add(vec1, vec2) {
      // Vector.checkInputs(vec1, vec2);
      return new Vector(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
   }

   static sub(vec1, vec2) {
      // Vector.checkInputs(vec1, vec2);
      return new Vector(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
   }

   static mul(vec1, vec2) {
      // Vector.checkInputs(vec1, vec2);
      return new Vector(vec1.x * vec2.x, vec1.y * vec2.y, vec1.z * vec2.z);
   }

   static scale(vec, s) {
      return new Vector(vec.x * s, vec.y * s, vec.z * s);
   }

   static div(vec1, vec2) {
      // Vector.checkInputs(vec1, vec2);
      return new Vector(vec1.x / vec2.x, vec1.y / vec2.y, vec1.z / vec2.z);
   }

   static mag(vec) {
      return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
   }

   static magSq(vec) {
      return vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
   }

   static normalize(vec) {
      const mag = Vector.mag(vec);
      return new Vector(vec.x / mag, vec.y / mag, vec.z / mag);
   }

   static dot(vec1, vec2) {
      // Vector.checkInputs(vec1, vec2);
      return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
   }

   static cross(vec1, vec2) {
      return new Vector(
         vec1.y * vec2.z - vec1.z * vec2.y,
         vec1.z * vec2.x - vec1.x * vec2.z,
         vec1.x * vec2.y - vec1.y * vec2.x
      );
   }

   static copy(vec) {
      return new Vector(vec.x, vec.y, vec.z);
   }

   static axisVal(vec, axis) {
      if (axis === 1) {
         return vec.y;
      }
      if (axis === 2) {
         return vec.z;
      }
      return vec.x;
   }

   static reflect(vec, normal) {
      return Vector.sub(vec, Vector.scale(normal, 2 * Vector.dot(vec, normal)));
   }

   static refract(vec, normal, eoe) {
      const cosTheta = Math.min(Vector.dot(Vector.scale(vec, -1), normal), 1);
      const rOutPerp = Vector.scale(Vector.add(vec, Vector.scale(normal, cosTheta)), eoe);
      const rOutParallel = Vector.scale(normal, -Math.sqrt(Math.abs(1.0 - rOutPerp.magSq())));
      return Vector.add(rOutPerp, rOutParallel);
   }

   static nearZero(vec) {
      return Math.abs(vec.x) < EPS && Math.abs(vec.y) < EPS && Math.abs(vec.z) < EPS;
   }
}

function vec3(x, y, z) {
   return new Vector(x, y, z);
}

function randVec3(min, max) {
   if (min == null || max == null) {
      return vec3(Math.random(), Math.random(), Math.random());
   }

   return vec3(randomDouble(min, max), randomDouble(min, max), randomDouble(min, max));
}

function randVec3InUnitSphere() {
   while (true) {
      const p = randVec3(-1, 1);
      if (p.magSq() < 1) {
         return p;
      }
   }
}

function randVec3InNormDisk() {
   while (true) {
      const p = randVec3(-1, 1);
      p.z = 0;

      if (p.magSq() < 1) {
         return p;
      }
   }
}

function randVec3OnHemisphere(normal) {
   const onUnitSphere = randNormVec3();
   if (Vector.dot(onUnitSphere, normal) > 0) {
      return onUnitSphere;
   }
   return Vector.mul(onUnitSphere, -1);
}

function randNormVec3() {
   return Vector.normalize(randVec3InUnitSphere());
}

export { Vector, vec3, randVec3, randNormVec3, randVec3OnHemisphere, randVec3InNormDisk };
