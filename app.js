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

function setup() {
   Renderer = createCanvas(I_WIDTH, I_HEIGHT);
   Camera = new PCamera(I_WIDTH, I_HEIGHT);
   Scene = TestScene(Camera);
   // Scene = DemoScene(Camera);

   GUI = createUserInterface(Camera, draw);
}

function draw() {
   Renderer.render(() => {
      Camera.render(Renderer.pixels, Renderer.getChunkInterval());
   });
}

setup();
draw();
