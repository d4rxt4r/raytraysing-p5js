let camSpp;
let camDepth;

const defaultSettings = {
   spp: 20,
   maxDepth: 15,
   vFov: 20,
   defocusAngle: 0,
   focusDist: 1,
   viewX: 0,
   viewY: 0,
   viewZ: 0,
   posX: 10,
   posY: 2,
   posZ: 3
};

function copySettingsFromCamera(camera, settings, { render, fullRender }) {
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
      render();
   };
   settings.renderFull = function () {
      fullRender();
   };
}

function debounce(func, ms) {
   let timeout;
   return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), ms);
   };
}

function _moveCameraView(camera, axis, val, callback) {
   camera.spp = 1;
   camera.maxDepth = 3;
   camera.lookAt[axis] = val;
   camera.init();
   callback();
}
const moveCameraView = debounce(_moveCameraView, 100);

function _restoreCameraSettings(camera, callback) {
   camera.spp = camSpp;
   camera.pixelSamplesScale = 1 / camSpp;
   camera.maxDepth = camDepth;
   camera.init();
}
const restoreCameraSettings = debounce(_restoreCameraSettings, 2000);

function _moveCamera(camera, axis, val, callback) {
   camera.spp = 1;
   camera.maxDepth = 3;
   camera.lookFrom[axis] = val;
   camera.init();

   callback();
}

const moveCamera = debounce(_moveCamera, 100);

export function createUserInterface(cameraSettings, { render, fullRender }) {
   copySettingsFromCamera(cameraSettings, defaultSettings, { render, fullRender });

   camSpp = defaultSettings.spp;
   camDepth = defaultSettings.maxDepth;

   const GUI = new dat.gui.GUI({ name: 'Render Setting' });
   GUI.remember(defaultSettings);

   const preview = GUI.addFolder('Preview');
   preview.closed = false;
   preview
      .add(defaultSettings, 'spp')
      .min(1)
      .max(1000)
      .step(1)
      .onFinishChange((spp) => {
         camSpp = spp;
         // cameraSettings.spp = spp;
         // cameraSettings.init();
      });
   preview
      .add(defaultSettings, 'maxDepth')
      .min(1)
      .max(100)
      .step(1)
      .onFinishChange((maxDepth) => {
         camDepth = maxDepth;
         // cameraSettings.maxDepth = maxDepth;
         // cameraSettings.init();
      });
   preview
      .add(defaultSettings, 'vFov')
      .min(1)
      .max(120)
      .step(1)
      .onFinishChange((vFov) => {
         // cameraSettings.vFov = vFov;
         // cameraSettings.init();
      });

   preview
      .add(defaultSettings, 'focusDist')
      .min(0.1)
      .max(100)
      .step(0.1)
      .onFinishChange((focusDist) => {
         // cameraSettings.focusDist = focusDist;
         // cameraSettings.init();
      });
   preview
      .add(defaultSettings, 'defocusAngle')
      .min(0)
      .max(10)
      .step(0.001)
      .onFinishChange((defocusAngle) => {
         // cameraSettings.defocusAngle = defocusAngle;
         // cameraSettings.init();
      });

   preview
      .add(defaultSettings, 'viewX')
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange((val) => {
         // moveCameraView(cameraSettings, 'x', val, defaultSettings.render);
      })
      .onFinishChange(() => {
         // restoreCameraSettings(cameraSettings, defaultSettings.render);
      });

   preview
      .add(defaultSettings, 'viewY')
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange((val) => {
         // moveCameraView(cameraSettings, 'y', val, defaultSettings.render);
      })
      .onFinishChange(() => {
         // restoreCameraSettings(cameraSettings, defaultSettings.render);
      });

   preview
      .add(defaultSettings, 'viewZ')
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange((val) => {
         // moveCameraView(cameraSettings, 'z', val, defaultSettings.render);
      })
      .onFinishChange(() => {
         // restoreCameraSettings(cameraSettings, defaultSettings.render);
      });

   preview
      .add(defaultSettings, 'posX')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         // moveCamera(cameraSettings, 'x', val, defaultSettings.render);
      })
      .onFinishChange(() => {
         // restoreCameraSettings(cameraSettings, defaultSettings.render);
      });

   preview
      .add(defaultSettings, 'posY')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         // moveCamera(cameraSettings, 'y', val, defaultSettings.render);
      })
      .onFinishChange(() => {
         // restoreCameraSettings(cameraSettings, defaultSettings.render);
      });

   preview
      .add(defaultSettings, 'posZ')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         // moveCamera(cameraSettings, 'z', val, defaultSettings.render);
      })
      .onFinishChange(() => {
         // restoreCameraSettings(cameraSettings, defaultSettings.render);
      });

   GUI.add(defaultSettings, 'render');
   GUI.add(defaultSettings, 'renderFull');

   return GUI;
}
