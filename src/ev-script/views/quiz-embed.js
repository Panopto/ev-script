define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed'),
        // We borrow portions of video-embed impl
        VideoEmbedView = require('ev-script/views/video-embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/quiz-embed.html')),
        initialize: function(options) {

            _.bindAll(this, 'render', 'getSrcUrl');

            EmbedView.prototype.initialize.call(this, options);
        },
        getSrcUrl: function(width, height, isPreview) {
            var key = this.model.get('content').key,
                url = URI(this.config.ensembleUrl);

            url.path('/hapi/v1/quiz/' + key + (isPreview ? '/preview' : '/plugin'));
            url.addQuery({
                'displayTitle': this.model.get('showtitle'),
                'displayAttachments': this.model.get('attachments'),
                'displayLinks': this.model.get('links'),
                'displayMetaData': this.model.get('metadata'),
                'displayCredits': this.model.get('metadata'),
                'showCaptions': this.model.get('showcaptions')
            });
            return url;
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
            return this.getMediaHeight();
        },
        scale: function(maxWidth, maxHeight) {
            return VideoEmbedView.prototype.scale.call(this, maxWidth, maxHeight);
        },
        render: function(isPreview) {
            return VideoEmbedView.prototype.render.call(this, isPreview);
        }
    });

});
