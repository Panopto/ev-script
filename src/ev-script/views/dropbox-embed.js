define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/dropbox-embed.html')),
        initialize: function(options) {

            _.bindAll(this, 'render', 'getUrl');

            EmbedView.prototype.initialize.call(this, options);
        },
        getUrl: function(isPreview) {
            return URI(this.config.ensembleUrl + '/hapi/v1/Dropboxes/' +
                this.model.get('id') + '/Show');
        },
        render: function(isPreview) {
            this.$el.html(this.template({
                'src': this.getUrl(isPreview),
                'title': this.model.get('content').title
            }));
        }
    });

});
