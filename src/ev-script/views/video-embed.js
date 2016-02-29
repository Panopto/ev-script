define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/video-embed.html')),
        legacyTemplate: _.template(require('text!ev-script/templates/video-embed-legacy.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            // Width and height really should be set by now...but use a reasonable default if not
            var width = (this.model.get('width') ? this.model.get('width') : '640'),
                height = (this.model.get('height') ? this.model.get('height') : '360'),
                showTitle = this.model.get('showtitle'),
                embed = '';
            if (this.info.checkVersion('>=3.12.0')) {
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
                    height: height
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
        }
    });

});
