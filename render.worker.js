// Ensure that Math.random gives same output on all workers
import { alea } from './lib/alea.min.js';
Math.random = alea;

import RCamera from './classes/Camera.js';
import {
   TestScene,
   TestSceneCamera,
   DemoScene,
   DemoSceneCamera,
   DarkScene,
   DarkSceneCamera,
   QuadsScene,
   QuadsSceneCamera,
   CornellBox,
   CornellBoxCamera
} from './scenes.js';

let Scene;
let Camera;
let pixelColor;
onmessage = (e) => {
   const { action, camera, data } = e.data;

   if (action === 'render') {
      pixelColor = Camera.render(Scene, data.x, data.y);
      postMessage({ ...data, color: pixelColor });

      return;
   }

   if (action === 'initCamera') {
      Camera = new RCamera(camera.imageWidth, camera.imageHeight, DarkSceneCamera);

      if (!Scene) {
         Scene = DarkScene();
      }

      return;
   }

   if (action === 'setCameraSettings') {
      return;
   }
};
