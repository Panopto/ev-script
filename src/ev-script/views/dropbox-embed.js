define(function(require) {

    'use strict';

    var _ = require('underscore'),
        EmbedView = require('ev-script/views/embed'),
        // We borrow portions of video-embed impl
        VideoEmbedView = require('ev-script/views/video-embed'),
        sizeUtil = require('ev-script/util/size');

    return EmbedView.extend({
        fixedTemplate: _.template(require('text!ev-script/templates/dropbox-embed-fixed.html')),
        responsiveTemplate: _.template(require('text!ev-script/templates/dropbox-embed-responsive.html')),
        legacytemplate: _.template(require('text!ev-script/templates/dropbox-embed-legacy.html')),
        initialize: function(options) {

            _.bindAll(this, 'render', 'getUrl', 'isEmbedSupported');

            EmbedView.prototype.initialize.call(this, options);
        },
        isEmbedSupported: function() {
            return this.info.checkVersion('5.3.0', '>=');
        },
        getMediaWidth: function() {
            return parseInt(this.model.get('width'), 10);
        },
        getMediaHeight: function() {
            var dropbox = this.model.get('content') || {},
                width = parseInt(this.model.get('width'), 10),
                height = parseInt(this.model.get('height'), 10);
            if (width < 768) {
                if (dropbox.showDescription) {
                    height += 150;
                }
                if (dropbox.showKeywords) {
                    height += 150;
                }
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
            // Assuming if localStorage is not available that third-party
            // cookies are blocked.  In that case need to preview in new window.
            return this.isEmbedSupported() && this.config.hasStorage ?
                this.config.ensembleUrl + '/hapi/v1/ui/dropboxes/' + this.model.get('id') + '/embed' :
                this.model.get('content').url;
        },
        scale: function(maxWidth, maxHeight) {
            this.model.set('width', Math.min(this.getFrameWidth(), maxWidth));
            this.model.set('height', Math.min(this.getFrameHeight(), maxHeight));
        },
        render: function(isPreview) {
            var embedType = this.model.get('embedtype'),
                title = this.model.get('content').name,
                embed;
            if (this.isEmbedSupported()) {
                if (embedType === 'fixed') {
                    embed = this.fixedTemplate({
                        'src': this.getUrl(),
                        'title': title,
                        'width': isPreview ? this.model.get('width') : this.getFrameWidth(),
                        'height': isPreview ? this.model.get('height') : this.getFrameHeight()
                    });
                } else if (embedType === 'responsive') {
                    embed = this.responsiveTemplate({
                        'src': this.getUrl(),
                        'title': title
                    });
                }
            } else {
                embed = this.legacyTemplate({
                    'src': this.getUrl(),
                    'title': this.model.get('content').name
                });
            }
            this.$el.html(embed);
        }
    });

});
