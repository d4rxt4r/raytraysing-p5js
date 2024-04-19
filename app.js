import { createCanvas } from 'utils/canvas.js';
import { createUserInterface } from 'utils/gui.js';
import { preloadTextures } from 'utils/image.js';

const textures = await preloadTextures();
const Renderer = createCanvas();
Renderer.setTextures(textures);
const GUI = createUserInterface(Renderer);
GUI.closed = true;
