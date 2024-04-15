self.onmessage = function (msg) {
   // console.warn('From worker', msg.data);

   self.postMessage('Hello from worker');
};
