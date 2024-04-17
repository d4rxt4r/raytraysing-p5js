import { createCanvas } from 'utils/canvas.js';
import { preloadTextures } from 'utils/image.js';
import { createUserInterface } from 'utils/gui.js';

let Renderer;
let GUI;

async function preload() {
   await preloadTextures();
}

function setup() {
   Renderer = createCanvas();
   GUI = createUserInterface(Renderer);
}

await preload();
setup();

Renderer.render();
