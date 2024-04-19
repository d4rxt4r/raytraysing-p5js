export default class Interval {
   /**
    * The minimum value of the interval.
    * @type {number}
    */
   min;

   /**
    * The maximum value of the interval.
    * @type {number}
    */
   max;

   /**
    * @param {[Interval]|[Interval, Interval]|[number, number]} args
    */
   constructor(...args) {
      if (args[0] instanceof Interval && args[1] instanceof Interval) {
         this.min = Math.min(args[0].min, args[1].min);
         this.max = Math.max(args[0].max, args[1].max);

         return;
      }

      if (args[0] instanceof Interval) {
         this.min = args[0].min;
         this.max = args[0].max;

         return;
      }

      this.min = args[0] ?? -Infinity;
      this.max = args[1] ?? Infinity;
   }

   /**
    * Returns the size of the interval.
    *
    * @return {number}
    */
   get size() {
      return this.max - this.min;
   }

   /**
    * Expands the interval by the given delta.
    *
    * @param {number} delta - The amount by which to expand the interval.
    * @return {void} This function does not return a value.
    */
   expand(delta) {
      const padding = delta / 2;
      this.min -= padding;
      this.max += padding;
   }

   /**
    * Checks if the given value is within the interval.
    *
    * @param {number} x
    * @return {boolean}
    */
   contains(x) {
      return this.min <= x && x <= this.max;
   }

   /**
    * Checks if the given value is within the interval, including the boundaries.
    *
    * @param {number}
    * @return {boolean}
    */
   surrounds(x) {
      return x > this.min && x < this.max;
   }

   /**
    * Clamps the given value to the interval [min, max].
    *
    * @param {number} x
    * @return {number} The clamped value.
    */
   clamp(x) {
      if (x < this.min) return this.min;
      if (x > this.max) return this.max;
      return x;
   }

   static add(it, disp) {
      return new Interval(it.min + disp, it.max + disp);
   }

   static minmax(a, b) {
      return a <= b ? new Interval(a, b) : new Interval(b, a);
   }
}
