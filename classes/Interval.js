export default class Interval {
   constructor(min = -Infinity, max = Infinity) {
      if (min instanceof Interval && max instanceof Interval) {
         this.min = min.min <= max.min ? min.min : max.min;
         this.max = min.max >= max.max ? min.max : max.max;

         return;
      }

      if (min instanceof Interval) {
         this.min = min.min;
         this.max = min.max;

         return;
      }

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

   expand(delta) {
      const padding = delta / 2;
      return new Interval(this.min - padding, this.max + padding);
   }

   static minmax(a, b) {
      return a <= b ? new Interval(a, b) : new Interval(b, a);
   }
}
