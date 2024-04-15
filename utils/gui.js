let camSpp;
let camDepth;

const settingsObject = {
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

function copySettingsFromCamera(camera, settings, drawCallback) {
   settings.spp = camera.spp ?? settings.spp;
   settings.maxDepth = camera.maxDepth ?? settings.maxDepth;
   settings.vFov = camera.vFov ?? settings.vFov;
   settings.posX = camera.lookFrom.x ?? settings.posX;
   settings.posY = camera.lookFrom.y ?? settings.posY;
   settings.posZ = camera.lookFrom.z ?? settings.posZ;
   settings.viewX = camera.lookAt.x ?? settings.viewX;
   settings.viewY = camera.lookAt.y ?? settings.viewY;
   settings.viewZ = camera.lookAt.z ?? settings.viewZ;
   settings.defocusAngle = camera.defocusAngle ?? settings.defocusAngle;
   settings.focusDist = camera.focusDist ?? settings.focusDist;
   settings.render = function () {
      drawCallback();
   };
}

function moveCameraView(camera, axis, val, callback) {
   camera.spp = 1;
   camera.maxDepth = 2;
   camera.lookAt[axis] = val;
   camera.init();

   callback();
}

function restoreCameraSettings(camera, callback) {
   camera.spp = camSpp;
   camera.pixelSamplesScale = 1 / camSpp;
   camera.maxDepth = camDepth;
   camera.init();

   callback();
}

function moveCamera(camera, axis, val, callback) {
   camera.spp = 1;
   camera.maxDepth = 2;
   camera.lookFrom[axis] = val;
   camera.init();

   callback();
}

export function createUserInterface(Camera, drawCallback) {
   copySettingsFromCamera(Camera, settingsObject, drawCallback);

   camSpp = settingsObject.spp;
   camDepth = settingsObject.maxDepth;

   const GUI = new dat.gui.GUI({ name: 'Render Setting' });
   GUI.remember(settingsObject);

   const preview = GUI.addFolder('Preview');
   preview.closed = false;
   preview
      .add(settingsObject, 'spp')
      .min(1)
      .max(100)
      .step(1)
      .onFinishChange((spp) => {
         camSpp = spp;
         Camera.spp = spp;
         Camera.pixelSamplesScale = 1 / spp;
      });
   preview
      .add(settingsObject, 'maxDepth')
      .min(1)
      .max(100)
      .step(1)
      .onFinishChange((maxDepth) => {
         camDepth = maxDepth;
         Camera.maxDepth = maxDepth;
      });
   preview
      .add(settingsObject, 'vFov')
      .min(1)
      .max(120)
      .step(1)
      .onFinishChange((vFov) => {
         Camera.vFov = vFov;
         Camera.init();
      });

   preview
      .add(settingsObject, 'focusDist')
      .min(0.1)
      .max(100)
      .step(0.1)
      .onFinishChange((focusDist) => {
         Camera.focusDist = focusDist;
         Camera.init();
      });
   preview
      .add(settingsObject, 'defocusAngle')
      .min(0)
      .max(10)
      .step(0.001)
      .onFinishChange((defocusAngle) => {
         Camera.defocusAngle = defocusAngle;
         Camera.init();
      });

   preview
      .add(settingsObject, 'viewX')
      .min(-1)
      .max(1)
      .step(0.01)
      .onChange((val) => {
         moveCameraView(Camera, 'x', val, settingsObject.render);
      })
      .onFinishChange(() => {
         restoreCameraSettings(Camera, settingsObject.render);
      });

   preview
      .add(settingsObject, 'viewY')
      .min(-1)
      .max(1)
      .step(0.01)
      .onChange((val) => {
         moveCameraView(Camera, 'y', val, settingsObject.render);
      })
      .onFinishChange(() => {
         restoreCameraSettings(Camera, settingsObject.render);
      });

   preview
      .add(settingsObject, 'viewZ')
      .min(-1)
      .max(1)
      .step(0.01)
      .onChange((val) => {
         moveCameraView(Camera, 'z', val, settingsObject.render);
      })
      .onFinishChange(() => {
         restoreCameraSettings(Camera, settingsObject.render);
      });

   preview
      .add(settingsObject, 'posX')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         moveCamera(Camera, 'x', val, settingsObject.render);
      })
      .onFinishChange(() => {
         restoreCameraSettings(Camera, settingsObject.render);
      });

   preview
      .add(settingsObject, 'posY')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         moveCamera(Camera, 'y', val, settingsObject.render);
      })
      .onFinishChange(() => {
         restoreCameraSettings(Camera, settingsObject.render);
      });

   preview
      .add(settingsObject, 'posZ')
      .min(-100)
      .max(100)
      .step(0.1)
      .onChange((val) => {
         moveCamera(Camera, 'z', val, settingsObject.render);
      })
      .onFinishChange(() => {
         restoreCameraSettings(Camera, settingsObject.render);
      });

   GUI.add(settingsObject, 'render');

   return GUI;
}
