import { alea } from './lib/alea.min.js';
import { SCENE_LIST } from './scenes.js';
import { LOADED_TEX, LOW_RES, getHeight, UserImage } from './utils/image.js';
import RCamera from './classes/Camera.js';

let currentScene;
let Scene;
let Lights;
let Camera = {};

let originalSpp;
let originalDepth;
let originalWidth;
let originalHeight;

function saveCameraSettings(Camera) {
   originalSpp = Camera.spp;
   originalDepth = Camera.maxDepth;
   originalWidth = Camera.imageWidth;
   originalHeight = Camera.imageHeight;
}

function restoreCameraSettings(Camera) {
   Camera.spp = originalSpp;
   Camera.maxDepth = originalDepth;
   Camera.imageWidth = originalWidth;
   Camera.imageHeight = originalHeight;
}

onmessage = (e) => {
   const { action, scene, data, settings, textures } = e.data;

   if (action === 'render') {
      return postMessage({ ...data, color: Camera.render(data.x, data.y, Scene, Lights) });
   }

   if (action === 'setTextures') {
      for (const texture of textures) {
         LOADED_TEX.push(new UserImage(texture._imageData));
      }
   }

   if (action === 'restoreCamera') {
      restoreCameraSettings(Camera);
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
      // Use same seed for random number generation across all workers
      Math.random = alea(scene);

      currentScene = scene;
      Scene = SCENE_LIST[scene].scene();
      Lights = SCENE_LIST[scene].lights();
      Camera = new RCamera(Camera?.imageWidth, Camera?.imageHeight, SCENE_LIST[scene].camera);

      saveCameraSettings(Camera);
      return;
   }

   if (action === 'settings') {
      for (const [setting, value] of Object.entries(settings)) {
         Camera[setting] = value;
      }

      saveCameraSettings(Camera);
      Camera.init?.();
      return;
   }
};
