define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/playlist-embed.html')),
        legacyTemplate: _.template(require('text!ev-script/templates/playlist-embed-legacy.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            var embed = '';
            if (this.info.checkVersion('>=3.12.0')) {
                embed = this.template({
                    modelId: this.model.get('id'),
                    ensembleUrl: this.config.ensembleUrl,
                    displayEmbedCode: this.model.get('embedcode'),
                    displayStatistics: this.model.get('statistics'),
                    displayDuration: this.model.get('duration'),
                    displayAttachments: this.model.get('attachments'),
                    displayAnnotations: this.model.get('annotations'),
                    displayLinks: this.model.get('links'),
                    displayCredits: this.model.get('credits'),
                    displaySharing: this.model.get('socialsharing'),
                    autoPlay: this.model.get('autoplay'),
                    showCaptions: this.model.get('showcaptions'),
                    displayDateProduced: this.model.get('dateproduced'),
                    audioPreviewImage: this.model.get('audiopreviewimage'),
                    displayCaptionSearch: this.model.get('captionsearch')
                });
            } else {
                embed = this.legacyTemplate({
                    modelId: this.model.get('id'),
                    ensembleUrl: this.config.ensembleUrl
                });
            }
            this.$el.html(embed);
        }
    });

});
