/**
 * Edit Controller
 */
define([
  'controller/base',
  'extend',
  'jquery',
  'helper/effect',
  'jquery.slider'
], 
function(BaseController, extend, $, EffectHelper, _slider) {

  function EditController(app) {
    EditController.superclass.constructor.call(this, app);
    this.templateURL = 'template/edit.html';
    this.template = null;
    this.$$canvasPreview = null;
    this.ctxPreview = null;
    this.$$canvasWork = document.createElement('canvas');
    this.ctxWork = this.$$canvasWork.getContext('2d');
  }

  extend(EditController, BaseController);

  EditController.prototype.stop = function() {
    this.unbindHandler();
  };

  EditController.prototype.run = function(index) {
    var that = this;
    
    that.currentImage = that.app.storage[index];

    // Image not found, 404 and return
    if (!that.currentImage) {
      that.app.throwError(404, 'Image not found');
      return false;
    }

    $.when(this.render())
    .then(function() {
      that.cacheElements();
      that.bindHandler();
      return that.currentImage.getImageElement();
    })
    .then(function(imageEl){
      that.$imgWrapper.empty().append(imageEl);
      that.$$canvasPreview.width = imageEl.width;
      that.$$canvasPreview.height = imageEl.height;
      that.ctxPreview.drawImage(imageEl, 0, 0);
      that.$$canvasWork.width = imageEl.width;
      that.$$canvasWork.height = imageEl.height;
      that.ctxWork.drawImage(imageEl, 0, 0);
    });

  };

  EditController.prototype.render = function() {
    var deferred = $.Deferred();
    var that = this;

    if (!this.template) {
      $.get(this.templateURL, function(res) {
        that.template = res;
        rendr();
      });
    }
    else {
      rendr();
    }

    function rendr() {
      that.app.$view.html(that.template);

      deferred.resolve();
    }

    return deferred.promise();
  };


  EditController.prototype.cacheElements = function() {
    this.$$canvasPreview = document.getElementById('canvas-preview');
    this.ctxPreview = this.$$canvasPreview.getContext('2d');
    this.$canvasLoader = $('#canvas-loading');

    this.$imgWrapper = $('#image-wrapper');

    this.$gaussian_blur_slide = $('#gaussian-blur-slide').slider();
    this.$median_slide = $('#median-slide').slider();
    this.$noise_slide = $('#noise-slide').slider();
  };


  EditController.prototype.bindHandler = function() {
    this.app.$view.on('click', '[data-close]', this.onCloseImage.bind(this));
    this.app.$view.on('click', '[data-save]', this.onSaveImage.bind(this));
    this.$gaussian_blur_slide.on('slideStop', this.updateFilter.bind(this));
    this.$median_slide.on('slideStop', this.updateFilter.bind(this));
    this.$noise_slide.on('slideStop', this.updateFilter.bind(this));
  };

  EditController.prototype.unbindHandler = function() {
    this.app.$view.off('click', '[data-close]');
    this.app.$view.off('click', '[data-save]');
    this.$gaussian_blur_slide.slider('destroy');
    this.$median_slide.slider('destroy');
    this.$noise_slide.slider('destroy');
  };

  EditController.prototype.updateFilter = function(event) {
    var that = this;
    var gaussian_blur_param = this.$gaussian_blur_slide.slider('getValue');
    var median_param = this.$median_slide.slider('getValue');
    var noise_param = this.$noise_slide.slider('getValue');
    var effects = [];
    var imageDataWork = this.ctxWork.getImageData(0, 0, this.$$canvasWork.width, this.$$canvasWork.height);

    that.$canvasLoader.show();

    EffectHelper.process('gaussian-blur', {imageData: imageDataWork, radius: gaussian_blur_param})
      .then(function(imageData) {
        return EffectHelper.process('median', {imageData: imageData, neighbors: median_param});
      }, stopLoading)
      .then(function(imageData){
        return EffectHelper.process('noise', {imageData: imageData, amount: noise_param });
      }, stopLoading)
      .then(function(imageData){
        that.ctxPreview.putImageData(imageData, 0, 0);
        stopLoading();
      }, stopLoading);

    function stopLoading() {
      that.$canvasLoader.hide();
    }
  };

  EditController.prototype.onCloseImage = function(event) {
    this.app.router.navigate('/', {trigger: true});
  };

  EditController.prototype.onSaveImage = function(event) {
    var imgDataUrl = this.$$canvasPreview.toDataURL();
    this.currentImage.setSrc(imgDataUrl);
    this.app.router.navigate('/', {trigger: true});
  };

  return EditController;
});
