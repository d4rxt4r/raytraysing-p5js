import { int } from 'utils/math.js';
import { createCanvas } from 'utils/canvas.js';
import { createUserInterface } from 'utils/gui.js';
import { TestScene, DemoScene } from 'scenes';
import PCamera from 'classes/Camera.js';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 256;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);

let Renderer;
let Scene;
let Camera;
let GUI;

/** @type {ImageData} */
let pixelsBuffer;

function setup() {
   Renderer = createCanvas(I_WIDTH, I_HEIGHT);
   Renderer.fill('#bada55');
   Renderer.rect(0, 0, I_WIDTH, I_HEIGHT);
   Renderer.render();
   pixelsBuffer = Renderer.createImageData();

   Camera = new PCamera(I_WIDTH, I_HEIGHT);
   Scene = TestScene(Camera);
   // Scene = DemoScene(Camera);

   GUI = createUserInterface(Camera, draw);
}

let t0;
function draw() {
   t0 = performance.now();

   Camera.render(pixelsBuffer.data);
   Renderer.putImageData(pixelsBuffer);
   Renderer.render();

   console.info('ℹ️ Generation took: ' + (performance.now() - t0).toFixed(2) + 'ms');

   // requestAnimationFrame(draw);
}

setup();
draw();
