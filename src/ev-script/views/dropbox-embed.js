define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/dropbox-embed.html')),
        initialize: function(options) {

            _.bindAll(this, 'getUrl', 'render');

            EmbedView.prototype.initialize.call(this, options);
        },
        // getFrameWidth: function() {},
        // getFrameHeight: function() {},
        getUrl: function() {
            return URI(this.config.ensembleUrl + '/hapi/v1/Dropboxes/' +
                this.model.get('shortName') + '/Show');
        },
        render: function(isPreview) {
            var src = this.getUrl();

            // TODO
            console.error('FIXME - using incorrect fixed url: ' + src.toString());

            this.$el.html(this.template({
                'href': src,
                'title': this.model.get('title')
            }));
        }
    });

});
