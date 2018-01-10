define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/video-embed.html')),
        initialize: function(options) {
            EmbedView.prototype.initialize.call(this, options);
        },
        render: function(isPreview) {
            // Width and height really should be set by now...but use a reasonable default if not
            var width = this.getMediaWidth(),
                height = this.getMediaHeight(),
                embed = this.template({
                    src: this.getSrcUrl(width, height, isPreview),
                    width: width,
                    height: height,
                    frameHeight: this.getFrameHeight()
                });
            this.$el.html(embed);
        },
        getSrcUrl: function(width, height, isPreview) {
            var atLeast480 = this.info.checkVersion('>=4.8.0'),
                id = this.model.get('id'),
                url = URI(this.config.ensembleUrl);
            if (atLeast480) {
                url.path('/hapi/v1/contents/' + id + '/plugin');
                url.addQuery('displayViewersReport', this.model.get('viewersreport'));
            } else {
                url.path('/app/plugin/embed.aspx');
                url.addQuery('ID', id);
            }
            url.addQuery({
                'autoPlay': this.model.get('autoplay'),
                'displayTitle': this.model.get('showtitle'),
                'displaySharing': this.model.get('socialsharing'),
                'displayAnnotations': this.model.get('annotations'),
                'displayCaptionSearch': this.model.get('captionsearch'),
                'displayAttachments': this.model.get('attachments'),
                'audioPreviewImage': this.model.get('audiopreviewimage'),
                'displayLinks': this.model.get('links'),
                'displayMetaData': this.model.get('metadata'),
                'displayDateProduced': this.model.get('dateproduced'),
                'displayEmbedCode': this.model.get('embedcode'),
                'displayDownloadIcon': this.model.get('download'),
                'showCaptions': this.model.get('showcaptions'),
                'hideControls': true,
                'width': width,
                'height': height,
                'isNewPluginEmbed': true
            });
            if (isPreview) {
                url.addQuery('isContentPreview', true);
            }
            return url;
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
            var height = this.getMediaHeight(),
                isAudio = this.model.get('isaudio'),
                audioPreviewImage = this.model.get('audiopreviewimage');
            if (isAudio) {
                if (this.isMenuVisible()) {
                    height = audioPreviewImage ? height + 40 : 155;
                } else {
                    height = audioPreviewImage ? height : 40;
                }
            } else {
                height += 40;
            }
            return height;
        },
        isMenuVisible: function() {
            return this.model.get('showtitle') ||
                   this.model.get('socialsharing') ||
                   this.model.get('annotations') ||
                   this.model.get('captionsearch') ||
                   this.model.get('attachments') ||
                   this.model.get('links') ||
                   this.model.get('metadata') ||
                   this.model.get('dateproduced') ||
                   this.model.get('embedcode') ||
                   this.model.get('download');
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
