import { SCENE_LIST } from './scenes.js';
import { LOW_RES, getHeight } from './utils/image.js';
import RCamera from './classes/Camera.js';

let currentScene;
let Scene;
let Camera = new RCamera();
let pixelColor;
let originalSpp;
let originalDepth;
let originalWidth;
let originalHeight;

onmessage = (e) => {
   const { action, scene, data, settings } = e.data;

   if (action === 'render') {
      pixelColor = Camera.render(Scene, data.x, data.y);
      return postMessage({ ...data, color: pixelColor });
   }

   if (action === 'restoreCamera') {
      Camera.spp = originalSpp;
      Camera.maxDepth = originalDepth;
      Camera.imageWidth = originalWidth;
      Camera.imageHeight = originalHeight;
      Camera.init();
      return;
   }

   if (action === 'moveCamera') {
      Camera.spp = 1;
      Camera.maxDepth = 3;
      Camera.imageWidth = LOW_RES;
      Camera.imageHeight = getHeight(LOW_RES);
      Camera[data.pos ? 'lookFrom' : 'lookAt'][data.axis] = data.val;
      Camera.init();
      return;
   }

   if (action === 'initScene') {
      currentScene = scene;
      Scene = SCENE_LIST[scene].scene();
      Camera = new RCamera(Camera?.imageWidth, Camera?.imageHeight, SCENE_LIST[scene].camera);

      originalSpp = Camera.spp;
      originalDepth = Camera.maxDepth;
      originalWidth = Camera.imageWidth;
      originalHeight = Camera.imageHeight;

      return;
   }

   if (action === 'settings') {
      for (const [setting, value] of Object.entries(settings)) {
         Camera[setting] = value;
      }

      originalSpp = Camera.spp;
      originalDepth = Camera.maxDepth;
      originalWidth = Camera.imageWidth;
      originalHeight = Camera.imageHeight;

      Camera.init();
      return;
   }
};
