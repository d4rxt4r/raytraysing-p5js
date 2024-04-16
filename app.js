import { int } from 'utils/math.js';
import { createCanvas } from 'utils/canvas.js';
import { createUserInterface } from 'utils/gui.js';
import { TestScene, TestSceneCamera, DemoScene } from 'scenes';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 256;
const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);

let Renderer;
let Scene;
let GUI;

function setup() {
   Renderer = createCanvas(I_WIDTH, I_HEIGHT);
   Scene = TestScene();
   // Scene = DemoScene(Camera);
   GUI = createUserInterface(TestSceneCamera, {
      render,
      fullRender: fullSizeRender
   });
}

function render() {
   Renderer.render();
}

function fullSizeRender() {
   const fWidth = window.innerWidth;
   const fHeight = int(fWidth / ASPECT_RATIO) < 1 ? 1 : int(fWidth / ASPECT_RATIO);

   Renderer.resizeCanvas(fWidth / 2, fHeight / 2);
}

setup();
render();
