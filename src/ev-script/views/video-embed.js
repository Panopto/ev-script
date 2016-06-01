define(function(require) {

    'use strict';

    var _ = require('underscore'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/video-embed.html')),
        legacyTemplate: _.template(require('text!ev-script/templates/video-embed-legacy.html')),
        initialize: function(options) {
            EmbedView.prototype.initialize.call(this, options);
        },
        render: function() {
            // Width and height really should be set by now...but use a reasonable default if not
            var width = this.getMediaWidth(),
                height = this.getMediaHeight(),
                showTitle = this.model.get('showtitle'),
                embed = '';
            if (!this.info.useLegacyEmbeds()) {
                embed = this.template({
                    ensembleUrl: this.config.ensembleUrl,
                    id: this.model.get('id'),
                    autoPlay: this.model.get('autoplay'),
                    displayTitle: showTitle,
                    displaySharing: this.model.get('socialsharing'),
                    displayAnnotations: this.model.get('annotations'),
                    displayCaptionSearch: this.model.get('captionsearch'),
                    displayAttachments: this.model.get('attachments'),
                    displayLinks: this.model.get('links'),
                    displayMetaData: this.model.get('metadata'),
                    displayDateProduced: this.model.get('dateproduced'),
                    displayEmbedCode: this.model.get('embedcode'),
                    displayDownloadIcon: this.model.get('download'),
                    showCaptions: this.model.get('showcaptions'),
                    width: width,
                    height: height,
                    frameHeight: this.getFrameHeight()
                });
            } else {
                embed = this.legacyTemplate({
                    ensembleUrl: this.config.ensembleUrl,
                    id: this.model.get('id'),
                    autoPlay: this.model.get('autoplay'),
                    displayTitle: showTitle,
                    hideControls: this.model.get('hidecontrols'),
                    showCaptions: this.model.get('showcaptions'),
                    width: width,
                    height: (showTitle ? height + 25 : height)
                });
            }
            this.$el.html(embed);
        },
        getMediaWidth: function() {
            return parseInt(this.model.get('width'), 10) || 640;
        },
        getMediaHeight: function() {
            return parseInt(this.model.get('height'), 10) || 360;
        },
        getFrameWidth: function() {
            return this.getMediaWidth();
        },
        getFrameHeight: function() {
            var height = this.getMediaHeight();
            if (this.model.get('isaudio')) {
                if (this.model.get('showtitle') ||
                    this.model.get('socialsharing') ||
                    this.model.get('annotations') ||
                    this.model.get('captionsearch') ||
                    this.model.get('attachments') ||
                    this.model.get('links') ||
                    this.model.get('metadata') ||
                    this.model.get('dateproduced') ||
                    this.model.get('embedcode') ||
                    this.model.get('download')) {
                    height = 155;
                } else {
                    height = 40;
                }
            } else {
                height += 40;
            }
            return height;
        },
        scale: function(maxWidth, maxHeight) {
            var ratio,
                embedWidth = this.getFrameWidth(),
                embedHeight = this.getFrameHeight(),
                mediaWidth = this.getMediaWidth(),
                mediaHeight = this.getMediaHeight();
            // We can't scale our audio
            if (this.model.get('isaudio')) {
                return;
            }
            while (embedWidth > maxWidth || embedHeight > maxHeight) {
                ratio = embedWidth > maxWidth ? maxWidth / embedWidth : maxHeight / embedHeight;
                this.model.set('width', Math.floor(mediaWidth * ratio));
                this.model.set('height', Math.floor(mediaHeight * ratio));
                embedWidth = this.getFrameWidth();
                embedHeight = this.getFrameHeight();
                mediaWidth = this.getMediaWidth();
                mediaHeight = this.getMediaHeight();
            }
        }
    });

});
