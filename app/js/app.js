define([
  'backbone', 
  'controller/index', 
  'controller/upload', 
  'controller/edit'
], 
function (Backbone, ControllerIndex, ControllerUpload, ControllerEdit) {

  var App = {

    init: function () {
      this.initVariables();
      this.initRouter();
      this.bindHandler();

      Backbone.history.start({pushState: false});
    },

    initVariables: function() {
      this.currentController = null;
      this.currentModal = null;
      this.router = null;
      this.storage = [];
      this.$view = $('#container');

      this.controllerIndex = new ControllerIndex(this);
      this.controllerUpload = new ControllerUpload(this);
      this.controllerEdit = new ControllerEdit(this);
    },

    initRouter: function() {
      var that = this;
      var workspace;

      workspace = Backbone.Router.extend({
        routes: {
          'upload'      : 'upload',
          'edit/:index' : 'edit',
          '*action'     : 'index'
        },

        upload: function() {
          that.stopPrev();
          that.currentController = that.controllerUpload;
          that.currentController.run();
        },

        edit: function(index) {
          that.stopPrev();
          that.currentController = that.controllerEdit;
          that.currentController.run(index);
        },

        index: function() {
          that.stopPrev();
          that.currentController = that.controllerIndex;
          that.currentController.run();
        }

      });

      that.router = new workspace();
    },

    bindHandler: function() {
      var that = this;
      $(document.documentElement).on('click', '[data-navigate]', this.navigate.bind(this));
    },


    navigate: function(event) {
      event.preventDefault();
      this.router.navigate(event.target.pathname, {trigger: true});
    },

    stopPrev: function() {
      if (this.currentController) {
        this.currentController.stop();
      }

      if (this.currentModal) {
        this.currentModal.modal('hide');
      }
    },

    throwError: function() {
      console.error(arguments);
    }

  };

  return App;
});