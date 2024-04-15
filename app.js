import { int } from 'utils/math.js';
// import { averageColorComponent } from 'utils/image.js';
import { TestScene } from 'scenes';
import PCamera from 'classes/Camera.js';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 128;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);
// const I_HEIGHT = 256;

const RENDER_CYCLES = 1;

let Scene;
let Camera;
let cycles = 0;

function setup() {
   pixelDensity(1);
   createCanvas(I_WIDTH, I_HEIGHT, WEBGL);
   loadPixels();

   Camera = new PCamera(I_WIDTH, I_HEIGHT);

   Scene = TestScene(Camera);
   // Scene = DemoScene(Camera);
}

let prev;
function draw() {
   performance.mark('testStart');

   // prev = Uint8ClampedArray.from(pixels);
   Camera.render(pixels);

   // for (let i = 0; i < prev.length; i += 4) {
   //    if (prev[i] + prev[i + 1] + prev[i + 2] === 0) {
   //       continue;
   //    }

   //    if (pixels[i] + pixels[i + 1] + pixels[i + 2] === 0) {
   //       pixels[i] = prev[i];
   //       pixels[i + 1] = prev[i + 1];
   //       pixels[i + 2] = prev[i + 2];
   //    } else {
   //       pixels[i] = averageColorComponent(pixels[i], prev[i]);
   //       pixels[i + 1] = averageColorComponent(pixels[i + 1], prev[i + 1]);
   //       pixels[i + 2] = averageColorComponent(pixels[i + 2], prev[i + 2]);
   //    }
   // }

   updatePixels();

   performance.mark('testEnd');
   performance.measure('draw', 'testStart', 'testEnd');
   console.warn('Generation took: ' + performance.getEntriesByName('draw')[0].duration.toFixed(2) + 'ms');

   cycles++;
   if (cycles >= RENDER_CYCLES) {
      noLoop();
   }
}

window.setup = setup;
window.draw = draw;
