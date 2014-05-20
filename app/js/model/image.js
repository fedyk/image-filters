define([
  'jquery'
],
function($) {

  function ImageModel(file) {
    this.fileReader = new FileReader();
    this.image = new Image();
  }

  ImageModel.prototype.readAsDataURL = function(file) {
    var that = this;
    var deferred = $.Deferred();

    // this.fileReader.onabort
    this.fileReader.onerror = function () {
      deferred.rejectWith(that);
    };

    this.fileReader.onload = function(event) {
      that.image.src = event.target.result;
      deferred.resolveWith(that, [event.target.result]);
    };

    this.fileReader.readAsDataURL(file);

    return deferred.promise();
  };

  ImageModel.prototype.getImageElement = function() {
    var deferred = $.Deferred();
    var that = this;

    if (that.image.complete) {
      deferred.resolve(that.image);
    } 
    else {
      that.image.onload = function () {
        deferred.resolve(that.image);
      };
    }

    return deferred.promise();
  };

  ImageModel.prototype.setSrc = function(src) {
    this.image.src = src;
  };

  ImageModel.prototype.getSrc = function(src) {
    return this.image.src;
  }

  return ImageModel;
});