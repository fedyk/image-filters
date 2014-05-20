requirejs.config({
  baseUrl: 'js',
  paths: {
    'jquery'            : 'lib/jquery-1.11.1.min',
    'jquery.bootstrap'  : 'lib/bootstrap.min',
    'jquery.slider'     : 'lib/bootstrap-slider',
    'backbone'          : 'lib/backbone-min',
    'underscore'        : 'lib/underscore-min',
    'domReady'          : 'lib/domReady',
    'text'              : 'lib/text',
    'template'          : '../template'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'backbone'
    },
    'underscore': {
      exports: '_'
    },
    'jquery.slider': {
      deps: ['jquery', 'jquery.bootstrap']
    }
  }
});

define('extend', function() {
  return function (Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
  };
});

// Start the main app logic.
requirejs(['app', 'jquery'], function(app, $) {
  app.init();
});