define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        fixedTemplate: _.template(require('text!ev-script/templates/video-embed-fixed.html')),
        responsiveTemplate: _.template(require('text!ev-script/templates/video-embed-responsive.html')),
        render: function(isPreview) {
            // Width and height really should be set by now...but use a reasonable default if not
            var width = this.getMediaWidth(),
                height = this.getMediaHeight(),
                frameHeight = this.getFrameHeight(),
                isAudio = this.model.get('isaudio'),
                embedType = this.model.get('embedtype'),
                title = this.model.get('content').name,
                embed;

            if (embedType === 'fixed') {
                embed = this.fixedTemplate({
                    src: this.getUrl(width, height, isPreview),
                    title: title,
                    width: width,
                    height: isAudio ? frameHeight : height,
                    frameHeight: this.getFrameHeight()
                });
            } else if (embedType === 'responsive') {
                embed = this.responsiveTemplate({
                    src: this.getUrl(width, height, isPreview),
                    title: title
                });
            }

            this.$el.html(embed);
        },
        getUrl: function(width, height, isPreview) {
            var id = this.model.get('id'),
                url = URI(this.config.ensembleUrl),
                mediaWidth = width || this.getMediaWidth(),
                mediaHeight = height || this.getMediaHeight(),
                basePath = '/hapi/v1/contents/' + id,
                action = isPreview && (!this.config.tpcEnabled || this.isTop()) ?
                    '/launch' : '/plugin';

            url.path(basePath + action);
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
                'displayEmbedCode': this.model.get('embedcode'),
                'displayDownloadIcon': this.model.get('download'),
                'displayViewersReport': this.model.get('viewersreport'),
                'displayAxdxs': this.model.get('axdxs'),
                'embedAsThumbnail': this.model.get('embedthumbnail'),
                'startTime': 0,
                'displayCredits': this.model.get('metadata'),
                'showCaptions': this.model.get('showcaptions'),
                'hideControls': true
            });
            if (this.model.get('embedtype') === 'fixed') {
                url.addQuery({
                    'width': mediaWidth,
                    'height': mediaHeight
                });
            }
            if (isPreview) {
                url.addQuery('isContentPreview', true);
            }
            return url.toString();
        },
        getMediaWidth: function() {
            return parseInt(this.model.get('width'), 10) || 848;
        },
        getMediaHeight: function() {
            return parseInt(this.model.get('height'), 10) || 480;
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
                    height = audioPreviewImage ? height + 40 : 165;
                } else {
                    height = audioPreviewImage ? height : 40;
                }
            } else {
                height += 40;
            }
            return height;
        },
        isMenuVisible: function() {
            return this.model.get('socialsharing') ||
                   this.model.get('annotations') ||
                   this.model.get('captionsearch') ||
                   this.model.get('attachments') ||
                   this.model.get('links') ||
                   this.model.get('metadata') ||
                   this.model.get('embedcode') ||
                   this.model.get('download') ||
                   this.model.get('viewersreport');
        },
        scale: function(maxWidth, maxHeight) {
            var ratio,
                embedWidth = this.getFrameWidth(),
                embedHeight = this.getFrameHeight(),
                mediaWidth = this.getMediaWidth(),
                mediaHeight = this.getMediaHeight();
            if (this.model.get('isaudio') || // We can't scale our audio
                this.model.get('embedtype') === 'responsive') {
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
