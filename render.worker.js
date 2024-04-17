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
   const { action, camera, x, y } = e.data;

   if (action === 'render') {
      pixelColor = Camera.render(Scene, x, y);
      postMessage({ x, y, color: pixelColor });

      return;
   }

   if (action === 'initCamera') {
      Camera = new RCamera(camera.imageWidth, camera.imageHeight, CornellBoxCamera);

      if (!Scene) {
         Scene = CornellBox();
      }

      return;
   }

   if (action === 'setCameraSettings') {
      return;
   }
};
