import { SCENE_NAMES, SCENE_LIST } from '../scenes.js';

const defaultSettings = {
   scene: SCENE_NAMES[0],
   renderRes: 0.1,
   spp: 20,
   maxDepth: 15,
   vFov: 30,
   defocusAngle: 0,
   focusDist: 3,
   viewX: 0,
   viewY: 0,
   viewZ: 0,
   posX: 10,
   posY: 2,
   posZ: 3
};

function copySettingsFromCamera(camera, settings, Renderer) {
   settings.spp = camera.spp ?? settings.spp;
   settings.maxDepth = camera.maxDepth ?? settings.maxDepth;
   settings.vFov = camera.vFov ?? settings.vFov;
   settings.posX = camera.lookFrom?.x ?? settings.posX;
   settings.posY = camera.lookFrom?.y ?? settings.posY;
   settings.posZ = camera.lookFrom?.z ?? settings.posZ;
   settings.viewX = camera.lookAt?.x ?? settings.viewX;
   settings.viewY = camera.lookAt?.y ?? settings.viewY;
   settings.viewZ = camera.lookAt?.z ?? settings.viewZ;
   settings.defocusAngle = camera.defocusAngle ?? settings.defocusAngle;
   settings.focusDist = camera.focusDist ?? settings.focusDist;
   settings.render = function () {
      Renderer.render();
   };
}

function debounce(func, ms) {
   let timeout;
   return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), ms);
   };
}

export function createUserInterface(Renderer) {
   copySettingsFromCamera(SCENE_LIST[defaultSettings.scene].camera, defaultSettings, Renderer);

   Renderer.setResolution(defaultSettings.renderRes);
   Renderer.setScene(defaultSettings.scene);

   const GUI = new dat.gui.GUI({ name: 'Render Setting' });
   GUI.remember(defaultSettings);

   GUI.add(defaultSettings, 'scene', SCENE_NAMES).onFinishChange((scene) => {
      Renderer.setScene(scene);
   });

   const preview = GUI.addFolder('Camera');
   preview.closed = false;

   preview
      .add(defaultSettings, 'renderRes')
      .min(0.01)
      .max(1)
      .step(0.01)
      .onFinishChange((renderRes) => {
         Renderer.setResolution(renderRes);
      });

   preview
      .add(defaultSettings, 'spp')
      .min(1)
      .max(1000)
      .step(1)
      .onFinishChange((spp) => {
         Renderer.setCameraSettings({ spp });
      });
   preview
      .add(defaultSettings, 'maxDepth')
      .min(1)
      .max(100)
      .step(1)
      .onFinishChange((maxDepth) => {
         Renderer.setCameraSettings({ maxDepth });
      });
   preview
      .add(defaultSettings, 'vFov')
      .min(1)
      .max(120)
      .step(1)
      .onFinishChange((vFov) => {
         Renderer.setCameraSettings({ vFov });
      });

   preview
      .add(defaultSettings, 'focusDist')
      .min(0.1)
      .max(100)
      .step(0.1)
      .onFinishChange((focusDist) => {
         Renderer.setCameraSettings({ focusDist });
      });
   preview
      .add(defaultSettings, 'defocusAngle')
      .min(0)
      .max(10)
      .step(0.001)
      .onFinishChange((defocusAngle) => {
         Renderer.setCameraSettings({ defocusAngle });
      });

   preview
      .add(defaultSettings, 'viewX')
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange((val) => {
         moveCamera('x', val);
      })
      .onFinishChange(() => {
         Renderer.restoreCameraSettings();
      });

   preview
      .add(defaultSettings, 'viewY')
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange((val) => {
         moveCamera('y', val);
      })
      .onFinishChange(() => {
         Renderer.restoreCameraSettings();
      });

   preview
      .add(defaultSettings, 'viewZ')
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange((val) => {
         moveCamera('z', val);
      })
      .onFinishChange(() => {
         Renderer.restoreCameraSettings();
      });

   const moveCamera = debounce(Renderer.moveCamera.bind(Renderer), 100);
   preview
      .add(defaultSettings, 'posX')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         moveCamera('x', val, true);
      })
      .onFinishChange(() => {
         Renderer.restoreCameraSettings();
      });

   preview
      .add(defaultSettings, 'posY')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         moveCamera('y', val, true);
      })
      .onFinishChange(() => {
         Renderer.restoreCameraSettings();
      });

   preview
      .add(defaultSettings, 'posZ')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         moveCamera('z', val, true);
      })
      .onFinishChange(() => {
         Renderer.restoreCameraSettings();
      });

   GUI.add(defaultSettings, 'render');

   Renderer.render();

   return GUI;
}
