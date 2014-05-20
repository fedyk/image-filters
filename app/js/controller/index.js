/**
 * Index Controller
 */
define([
  'controller/base',
  'extend',
  'text!template/index.html',
  'underscore'],
function(BaseController, extend, template, _) {
  
  function IndexController(app) {
    IndexController.superclass.constructor.call(this, app);
    this.template = _.template(template);
  }

  extend(IndexController, BaseController);

  IndexController.prototype.stop = function() {
    this.app.$view.off();
  };

  IndexController.prototype.run = function() {
    this.app.$view.html(this.template({
      images: this.app.storage
    }));

    this.bindHandler();
  };

  IndexController.prototype.bindHandler = function() {
    this.app.$view.on('click', '[data-edit-image]', this.editImage.bind(this));
  };

  IndexController.prototype.editImage = function(event) {
    var index = $(event.currentTarget).data('edit-image');
    this.app.router.navigate('edit/' + index, {trigger: true});
  };

  return IndexController;
});
