// Send log message to main thread
function log(message){
  postMessage({
    message: message,
    type: 'log'
  });
}

var METHODS = {
  'gaussian-blur': function(callback, options) {
    var imgData = options.imageData;
    var width = imgData.width;
    var height = imgData.height;
    var data = imgData.data;
    var len = data.length;
    var startTime = (new Date()).getTime();

    var sigma = options.radius; // radius
    var kernel, kernelSize, kernelSum;
    var abs_j, abs_i;
    var r = 0, g = 0, b = 0, a = 0, pixel;

    if (sigma <= 0) {
      callback({result: imgData});
      return false;
    }

    buildKernel();

    function buildKernel() {
      var ss = sigma * sigma;
      var factor = 2 * Math.PI * ss;
      kernel = [];
      kernel.push([]);
      var i = 0, j, g;
      do {
          g = Math.exp(-(i * i) / (2 * ss)) / factor;
          if (g < 1e-3) break;
          kernel[0].push(g);
          ++i;
      } while (i < 7);
      kernelSize = i;
      for (j = 1; j < kernelSize; ++j) {
          kernel.push([]);
          for (i = 0; i < kernelSize; ++i) {
              g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
              kernel[j].push(g);
          }
      }
      kernelSum = 0;
      for (j = 1 - kernelSize; j < kernelSize; ++j) {
          for (i = 1 - kernelSize; i < kernelSize; ++i) {
              kernelSum += kernel[Math.abs(j)][Math.abs(i)];
          }
      }
    }

    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        r = 0;
        g = 0;
        b = 0;
        a = 0;
        for (j = 1 - kernelSize; j < kernelSize; ++j) {
          if (y + j < 0 || y + j >= height) continue;
          for (i = 1 - kernelSize; i < kernelSize; ++i) {
            if (x + i < 0 || x + i >= width) continue;
            abs_j = Math.abs(j);
            abs_i = Math.abs(i);
            pixel = 4 * ((y + j) * width + (x + i));
            r += data[pixel + 0] * kernel[abs_j][abs_i];
            g += data[pixel + 1] * kernel[abs_j][abs_i];
            b += data[pixel + 2] * kernel[abs_j][abs_i];
            a += data[pixel + 3] * kernel[abs_j][abs_i];
          }
        }
        pixel = 4 * (y * width + x);
        data[pixel + 0] = r / kernelSum;
        data[pixel + 1] = g / kernelSum;
        data[pixel + 2] = b / kernelSum;
        data[pixel + 3] = a / kernelSum;
      }
    }

    for (var i = 0; i < data.length; i++) {
        imgData.data[i] = data[i];
    }

    callback({result: imgData});
  },


  'median': function(callback, options) {
    var imgData = options.imageData;
    var width = imgData.width, height = imgData.height;
    var inputData = imgData.data;
    var outputData = [];
    var neighbors = options.neighbors;
    var edge = Math.floor(neighbors / 2);
    var fx, fy, ifx, ify, fPixel, x, y;
    var pixel, r, g, b, a;

    if (edge < 1) {
      callback({result: imgData});
      return false;
    }

    for(x = 0; x < width; x++) {
      for(y = 0; y < height; y++) {
        pixel = 4 * (y * width + x);
        r = [];
        g = [];
        b = [];
        a = [];

        for(fx = -edge; fx <= edge; fx++) {
          ifx = x + fx;

          if (ifx < 0 || ifx >= width) continue;

          for(fy = -edge; fy <= edge; fy++) {
            ify = y + fy;

            if (ify < 0 || ify >= width) continue;

            fPixel = 4 * ( (ify) * width + ifx );

            r.push(inputData[fPixel + 0]);
            g.push(inputData[fPixel + 1]);
            b.push(inputData[fPixel + 2]);
            a.push(inputData[fPixel + 3]);
          }
        }

        r.sort(function(a,b){return a-b;});
        g.sort(function(a,b){return a-b;});
        b.sort(function(a,b){return a-b;});
        a.sort(function(a,b){return a-b;});
        outputData[pixel] = r[neighbors - 1];
        outputData[pixel+1] = g[neighbors - 1];
        outputData[pixel+2] = b[neighbors - 1];
        outputData[pixel+3] = inputData[pixel + 3];
      }
    }

    for (var i = imgData.data.length - 1; i >= 0; i--) {
      imgData.data[i] = outputData[i];
    }

    callback({result: imgData});
  },

  'noise': function(callback, options){
    var imgData = options.imageData;
    var width = imgData.width, height = imgData.height;
    var inputData = imgData.data;
    var outputData = [];
    var amount = options.amount;
    var n;
    
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var pixel = 4 * ( y * width + x);

        if(Math.random() <= 1) {
          for(var i = 0; i < 3; i++) {
            n = parseInt((2*Math.random()-1) * amount);
            inputData[pixel+i] += n;
          }
        }
      }
    }

    imgData.data = inputData;

    callback({result: imgData});
  },

  ping: function(callback){
    log('Ping command received, replying with pong.');
    callback({ result: 'pong' });
  }
};

addEventListener('message', function(event){
  var job = event.data;
  if (METHODS.hasOwnProperty(job.method)){
    METHODS[job.method](
      function(result){
        result.requestId = job.requestId;
        postMessage(result);
      },
      job.payload);
  }
  else {
    log("Attempt to call unknown method '" + job.method + "'.");
  }
});