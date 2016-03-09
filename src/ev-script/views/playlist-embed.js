define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/playlist-embed.html')),
        legacyTemplate: _.template(require('text!ev-script/templates/playlist-embed-legacy.html')),
        playlistParamsTemplate: _.template(require('text!ev-script/templates/playlist-embed-playlist-params.html')),
        showcaseParamsTemplate: _.template(require('text!ev-script/templates/playlist-embed-showcase-params.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            var embed = '';
            if (!this.info.useLegacyEmbeds()) {
                var data = {
                    modelId: this.model.get('id'),
                    width: this.model.get('width'),
                    height: this.model.get('height'),
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
                };
                if (this.model.get('layout') === 'showcase') {
                    var showcaseLayout = this.model.get('showcaseLayout');
                    data = _.extend(data, {
                        isShowcase: true,
                        showcaseParams: this.showcaseParamsTemplate({
                            // featuredContent: showcaseLayout.featuredContent,
                            categoryList: showcaseLayout.categoryList,
                            categoryOrientation: showcaseLayout.categoryOrientation
                        })
                    });
                } else {
                    var playlistLayout = this.model.get('playlistLayout');
                    data = _.extend(data, {
                        isShowcase: false,
                        playlistParams: this.playlistParamsTemplate({
                            playlistSortBy: playlistLayout.playlistSortBy,
                            playlistSortDirection: playlistLayout.playlistSortDirection
                        })
                    });
                }
                embed = this.template(data);
            } else {
                embed = this.legacyTemplate({
                    modelId: this.model.get('id'),
                    width: this.model.get('width'),
                    height: this.model.get('height'),
                    ensembleUrl: this.config.ensembleUrl
                });
            }
            this.$el.html(embed);
        }
    });

});
