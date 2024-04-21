import { randomDouble } from './math.js';

const EPS = 1e-8;

class Vector {
   /**
    * @type {number}
    */
   x;
   /**
    * @type {number}
    */
   y;
   /**
    * @type {number}
    */
   z;

   /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @return {Vector}
    */
   constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
   }

   add(vec) {
      this.x += vec.x;
      this.y += vec.y;
      this.z += vec.z;

      return this;
   }

   sub(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      this.z -= vec.z;

      return this;
   }

   mul(vec) {
      this.x *= vec.x;
      this.y *= vec.y;
      this.z *= vec.z;

      return this;
   }

   scale(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;

      return this;
   }

   div(vec) {
      this.x /= vec.x;
      this.y /= vec.y;
      this.z /= vec.z;

      return this;
   }

   normalize() {
      const mag = this.mag();
      return this.scale(1 / mag);
   }

   cross(vec) {
      return Vector.cross(this, vec);
   }

   dot(vec) {
      return Vector.dot(this, vec);
   }

   mag() {
      return Vector.mag(this);
   }

   magSq() {
      return Vector.magSq(this);
   }

   copy() {
      return Vector.copy(this);
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

   static add(vec1, vec2) {
      return new Vector(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
   }

   static sub(vec1, vec2) {
      return new Vector(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
   }

   static mul(vec1, vec2) {
      return new Vector(vec1.x * vec2.x, vec1.y * vec2.y, vec1.z * vec2.z);
   }

   static scale(vec, s) {
      return new Vector(vec.x * s, vec.y * s, vec.z * s);
   }

   static div(vec1, vec2) {
      return new Vector(vec1.x / vec2.x, vec1.y / vec2.y, vec1.z / vec2.z);
   }

   static mag(vec) {
      return Math.sqrt(Vector.magSq(vec));
   }

   static magSq(vec) {
      return vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
   }

   static normalize(vec) {
      const mag = Vector.mag(vec);
      return Vector.scale(vec, 1 / mag);
   }

   static dot(vec1, vec2) {
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

   /**
    * Returns the value of the specified axis of a vector.
    *
    * @param {Object} vec - The vector object.
    * @param {number} axis - The axis to retrieve the value from.
    * @return {number} The value of the specified axis.
    */
   static axisVal(vec, axis) {
      if (axis === 1) {
         return vec.y;
      }
      if (axis === 2) {
         return vec.z;
      }
      return vec.x;
   }

   /**
    * Reflects a vector off a surface defined by a normal vector.
    *
    * @param {Vector} vec - The vector to reflect.
    * @param {Vector} normal - The normal vector of the surface.
    * @return {Vector} The reflected vector.
    */
   static reflect(vec, normal) {
      return Vector.sub(vec, Vector.scale(normal, 2 * Vector.dot(vec, normal)));
   }

   /**
    * Calculates the refracted vector based on the input vector, normal vector, and exit optical
    * density over air (eoe). The refracted vector is calculated using Snell's law.
    *
    * @param {Vector} uv - The input vector.
    * @param {Vector} normal - The normal vector.
    * @param {number} eoe - The exit optical density over air.
    * @return {Vector} The refracted vector.
    */
   static refract(uv, normal, eoe) {
      const cosTheta = Math.min(Vector.scale(uv, -1).dot(normal), 1);
      const rOutPerp = Vector.scale(normal, cosTheta).add(uv).scale(eoe);
      const rOutParallel = Vector.scale(normal, -Math.sqrt(Math.abs(1 - rOutPerp.magSq())));
      return rOutPerp.add(rOutParallel);
   }

   /**
    * Checks if a vector is near zero.
    *
    * @param {Vector} vec - The vector to check.
    * @return {boolean}
    */
   static nearZero(vec) {
      return Math.abs(vec.x) < EPS && Math.abs(vec.y) < EPS && Math.abs(vec.z) < EPS;
   }

   /**
    * Generates a random 3D vector within the specified range.
    *
    * @param {number} min - The minimum value of the range (optional).
    * @param {number} max - The maximum value of the range (optional).
    * @return {Vector} The randomly generated 3D vector.
    */
   static random(min, max) {
      if (min === null || max === null) {
         return new Vector(Math.random(), Math.random(), Math.random());
      }

      return new Vector(randomDouble(min, max), randomDouble(min, max), randomDouble(min, max));
   }

   /**
    * Generates a random 3D vector with a magnitude of 1.
    *
    * @return {Vector}
    */
   static randomNorm() {
      while (true) {
         const p = Vector.random(-1, 1);
         if (p.magSq() < 1) {
            return p.normalize();
         }
      }
   }

   static randomOnHemisphere(normal) {
      const onUnitSphere = Vector.randomNorm();
      if (Vector.dot(onUnitSphere, normal) > 0.0) {
         return onUnitSphere;
      }
      return onUnitSphere.scale(-1);
   }

   /**
    * Generates a random vector within a normalized disk.
    *
    * @return {Vector}
    */
   static randomNormDisk() {
      while (true) {
         const p = Vector.random(-1, 1);
         p.z = 0;

         if (p.magSq() < 1) {
            return p;
         }
      }
   }
}

function vec3(x, y, z) {
   return new Vector(x, y, z);
}

const point3 = vec3;

function randomCosineDirection() {
   const r1 = Math.random();
   const r2 = Math.random();
   const phi = 2 * Math.PI * r1;
   const x = Math.cos(phi) * Math.sqrt(r2);
   const y = Math.sin(phi) * Math.sqrt(r2);
   const z = Math.sqrt(1 - r2);
   return vec3(x, y, z);
}

export { Vector, vec3, point3, randomCosineDirection };
