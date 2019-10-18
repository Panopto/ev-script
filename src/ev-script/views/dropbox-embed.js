define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed'),
        // We borrow portions of video-embed impl
        VideoEmbedView = require('ev-script/views/video-embed'),
        sizeUtil = require('ev-script/util/size');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/dropbox-embed.html')),
        legacytemplate: _.template(require('text!ev-script/templates/dropbox-embed-legacy.html')),
        initialize: function(options) {

            _.bindAll(this, 'render', 'getUrl', 'isEmbedSupported');

            EmbedView.prototype.initialize.call(this, options);
        },
        isEmbedSupported: function() {
            return this.info.checkVersion('>=5.3.0');
        },
        getMediaWidth: function() {
            return parseInt(this.model.get('width'), 10);
        },
        getMediaHeight: function() {
            var dropbox = this.model.get('content') || {},
                width = parseInt(this.model.get('width'), 10),
                height = parseInt(this.model.get('height'), 10);
            if (width < 768) {
                if (dropbox.showDescription && dropbox.showKeywords) {
                    height += 450;
                } else if (dropbox.showDescription || dropbox.showKeywords) {
                    height += 150;
                }
            } else if (dropbox.showDescription && dropbox.showKeywords) {
                height += 100;
            }
            return height;
        },
        getFrameWidth: function() {
            return this.getMediaWidth();
        },
        getFrameHeight: function() {
            return this.getMediaHeight();
        },
        getUrl: function(isPreview) {
            return this.isEmbedSupported() ?
                URI(this.config.ensembleUrl + '/hapi/v1/ui/dropboxes/' + this.model.get('id') + '/embed') :
                this.model.get('content').url;
        },
        scale: function(maxWidth, maxHeight) {
            return VideoEmbedView.prototype.scale.call(this, maxWidth, maxHeight);
        },
        render: function(isPreview) {
            var html;
            if (this.isEmbedSupported()) {
                html = this.template({
                    'src': this.getUrl(),
                    'title': this.model.get('content').title,
                    'width': this.getFrameWidth(),
                    'height': this.getFrameHeight()
                });
            } else {
                html = this.legacyTemplate({
                    'src': this.getUrl(),
                    'title': this.model.get('content').title
                });
            }
            this.$el.html(html);
        }
    });

});
