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

function randomDouble(min, max) {
   if (min == null || max == null) {
      return Math.random();
   }

   return min + (max - min) * Math.random();
}

function randomInt(min, max) {
   return int(randomDouble(min, max + 1));
}

export { int, deg2rad, randomDouble, randomInt };
