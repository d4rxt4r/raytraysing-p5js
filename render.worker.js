import RCamera from './classes/Camera.js';
import { TestScene, TestSceneCamera, DemoScene } from './scenes.js';

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
      Camera = new RCamera(camera.imageWidth, camera.imageHeight, TestSceneCamera);

      if (!Scene) {
         Scene = new TestScene();
      }

      return;
   }

   if (action === 'setCameraSettings') {
      return;
   }
};
