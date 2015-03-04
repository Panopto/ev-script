define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/video-embed.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            // Width and height really should be set by now...but use a reasonable default if not
            var width = (this.model.get('width') ? this.model.get('width') : '640'),
                height = (this.model.get('height') ? this.model.get('height') : '360'),
                showTitle = this.model.get('showtitle');
            var src = this.config.ensembleUrl + '/app/plugin/embed.aspx?ID=' + this.model.get('id') +
                '&autoPlay=' + this.model.get('autoplay') +
                '&displayTitle=' + showTitle +
                '&hideControls=' + this.model.get('hidecontrols') +
                '&showCaptions=' + this.model.get('showcaptions') +
                '&width=' + width +
                '&height=' + height;
            this.$el.html(this.template({
                src: src,
                width: width,
                height: (showTitle ? height + 25 : height)
            }));
        }
    });

});
