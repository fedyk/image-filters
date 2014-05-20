/**
 * Base Controller
 */
define([], function() {
  function BaseController(app) {
    this.app = app;
  }

  BaseController.prototype.stop = function() {
    this.app.$view.off();
    this.app.$view.empty();
  };

  BaseController.prototype.run = function() {
    this.app.$view.html('<p>Hell World!</p>');
    this.bindHandler();
  };

  BaseController.prototype.bindHandler = function() {};

  return BaseController;
});
