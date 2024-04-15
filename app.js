import { int } from 'utils/math.js';
import { createCanvas } from 'utils/canvas.js';
import { createUserInterface } from 'utils/gui.js';
import { TestScene, DemoScene } from 'scenes';
import PCamera from 'classes/Camera.js';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 256;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);

const cameraSettings = {
   spp: 20,
   maxDepth: 15,
   vFov: 20,
   viewX: 0,
   viewY: 0,
   viewZ: 0,
   posX: 13,
   posY: 2,
   posZ: 3,
   render: function () {
      draw();
   }
};

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

   cameraSettings.spp = Camera.spp;
   cameraSettings.maxDepth = Camera.maxDepth;
   cameraSettings.vFov = Camera.vFov;
   cameraSettings.posX = Camera.lookFrom.x;
   cameraSettings.posY = Camera.lookFrom.y;
   cameraSettings.posZ = Camera.lookFrom.z;
   cameraSettings.viewX = Camera.lookAt.x;
   cameraSettings.viewY = Camera.lookAt.y;
   cameraSettings.viewZ = Camera.lookAt.z;

   GUI = createUserInterface(Camera, cameraSettings);
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
