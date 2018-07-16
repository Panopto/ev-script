define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/dropbox-embed.html')),
        initialize: function(options) {

            _.bindAll(this, 'render');

            EmbedView.prototype.initialize.call(this, options);
        },
        render: function(isPreview) {
            var src = URI(this.config.ensembleUrl + '/hapi/v1/Dropboxes/' +
                this.model.get('id') + '/Embed/Show');

            this.$el.html(this.template({
                'src': src,
                'width': this.getFrameWidth(),
                'height': this.getFrameHeight(),
                'title': this.model.get('content').title
            }));
        }
    });

});
