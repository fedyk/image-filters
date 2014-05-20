define(['helper/webworker'], function(webworker) {
  var worker = webworker.createWebWorker('js/helper/effects.webworker.js');

  function processEffect(name, options) {
    return worker.call(name, options);
  }

  return {
    process: processEffect
  };
});
