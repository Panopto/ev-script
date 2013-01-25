/*global define*/
define(function(require) {

  'use strict';

  var Backbone = require('backbone');

  return Backbone.View.extend({
      initialize: function(options) {
          // Width and height really should be set by now...but use a reasonable default if not
          var width = (this.model.get('width') ? this.model.get('width') : '640');
          var height = (this.model.get('height') ? this.model.get('height') : '360');
          var html =
              '<iframe src="' +
              options.config.ensembleUrl +
              '/app/plugin/embed.aspx?ID=' + this.model.get('id') +
              '&autoPlay=' + this.model.get('autoplay') + '&displayTitle=' +
              this.model.get('showtitle') + '&hideControls=' +
              this.model.get('hidecontrols') + '&showCaptions=' +
              this.model.get('showcaptions') + '&width=' +
              width + '&height=' + height +
              '" frameborder="0" style="width:' +
              width + 'px;height:' + (parseInt(height, 10) + 56) +
              'px;" allowfullscreen></iframe>';
          this.$el.html(html);
      }
  });

});
