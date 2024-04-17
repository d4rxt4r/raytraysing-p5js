import { SCENE_LIST } from './scenes.js';
import RCamera from './classes/Camera.js';

let currentScene;
let Scene;
let Camera = new RCamera();
let pixelColor;

onmessage = (e) => {
   const { action, scene, data, settings } = e.data;

   if (action === 'render') {
      pixelColor = Camera.render(Scene, data.x, data.y);
      return postMessage({ ...data, color: pixelColor });
   }

   if (action === 'initScene') {
      currentScene = scene;
      Scene = SCENE_LIST[scene].scene();
      Camera = new RCamera(Camera?.imageWidth, Camera?.imageHeight, SCENE_LIST[scene].camera);
      return;
   }

   if (action === 'settings') {
      for (const [setting, value] of Object.entries(settings)) {
         Camera[setting] = value;
      }

      Camera.init();
      return;
   }
};
