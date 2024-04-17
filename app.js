import { int } from 'utils/math.js';
import { createCanvas } from 'utils/canvas.js';
import { preloadTextures } from 'utils/image.js';
import { createUserInterface } from 'utils/gui.js';

const ASPECT_RATIO = 16 / 9;
const I_WIDTH = 128;
const I_HEIGHT = I_WIDTH;
// const I_HEIGHT = int(I_WIDTH / ASPECT_RATIO) < 1 ? 1 : int(I_WIDTH / ASPECT_RATIO);

let Renderer;
let GUI;

async function preload() {
   await preloadTextures();
}

function setup() {
   Renderer = createCanvas(I_WIDTH, I_HEIGHT);
   GUI = createUserInterface(Renderer, {
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

await preload();
setup();
render();
