import { SCENE_LIST } from './scenes.js';
import RCamera from './classes/Camera.js';

let currentScene;
let Scene;
let Camera;
let pixelColor;

onmessage = (e) => {
   const { action, scene, camera, data } = e.data;

   if (action === 'render') {
      pixelColor = Camera.render(Scene, data.x, data.y);
      return postMessage({ ...data, color: pixelColor });
   }

   if (action === 'initScene') {
      currentScene = scene;
      Scene = SCENE_LIST[scene].scene();
      Camera = new RCamera(camera.imageWidth, camera.imageHeight, SCENE_LIST[scene].camera);
      return;
   }
};
