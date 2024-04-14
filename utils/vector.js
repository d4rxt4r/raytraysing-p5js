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
}

function vec3(x, y, z) {
   return new Vector(x, y, z);
}

export { Vector, vec3 };
