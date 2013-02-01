define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/video-embed.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            // Width and height really should be set by now...but use a reasonable default if not
            var width = (this.model.get('width') ? this.model.get('width') : '640');
            var height = (this.model.get('height') ? this.model.get('height') : '360');
            var src = this.config.ensembleUrl + '/app/plugin/embed.aspx?ID=' + this.model.get('id') + '&autoPlay=' + this.model.get('autoplay') + '&displayTitle=' + this.model.get('showtitle') + '&hideControls=' + this.model.get('hidecontrols') + '&showCaptions=' + this.model.get('showcaptions') + '&width=' + width + '&height=' + height;
            this.$el.html(this.template({
                src: src,
                width: width,
                height: height
            }));
        }
    });

});
