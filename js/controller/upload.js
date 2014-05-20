/**
 * Index Controller
 */
define([
  'controller/base',
  'model/image',
  'extend', 
  'text!template/upload.html',
  'underscore', 
  'jquery', 
  'jquery.bootstrap'],

function(BaseController, ImageModel, extend, template, _, $, $$) {

  function UploadController(app) {

    UploadController.superclass.constructor.call(this, app);

    this.$modal = $('<div/>', {class: "modal fade"});
    this.$modal.modal({show: false});
    this.$modal.appendTo(document.body);

    // this.fileApiSupported = window.File && window.FileReader && window.FileList && window.Blob;
  
    this.bindHandler();
  }

  extend(UploadController, BaseController);

  UploadController.prototype.stop = function() {
    this.$modal.off('change', '#input-image');
    this.$modal.off('click', '[data-save]');
  };

  UploadController.prototype.run = function() {
    this.files = [];
    this.$modal.html(template);
    this.$modal.modal('show');
    this.app.currentModal = this.$modal;

    // Bind Handler
    this.$modal.on('change', '#input-image', this.onSelectFile.bind(this));
    this.$modal.on('click', '[data-save]', this.onSave.bind(this));
  };


  UploadController.prototype.onSelectFile = function(event) {
    this.files = event.target.files;
  };

  UploadController.prototype.onSave = function(event) {
    var that = this;
    var promises = [];
    var lastIndex, image, i;

    if (this.files.length) {
      for (i = 0; i < this.files.length; i++) {
        image = new ImageModel();
        this.app.storage.unshift(image);
        promises.push(image.readAsDataURL(this.files[i]));
      }

      $.when.apply($, promises).done(function() {
        that.app.router.navigate('edit/' + 0, {trigger: true});
      });
    }
    else {
      this.app.router.navigate('', {trigger: true});
    }
  };

  return UploadController;
});
