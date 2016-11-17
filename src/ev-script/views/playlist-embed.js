define(function(require) {

    'use strict';

    var _ = require('underscore'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/playlist-embed.html')),
        legacyTemplate: _.template(require('text!ev-script/templates/playlist-embed-legacy.html')),
        playlistParamsTemplate: _.template(require('text!ev-script/templates/playlist-embed-playlist-params.html')),
        showcaseParamsTemplate: _.template(require('text!ev-script/templates/playlist-embed-showcase-params.html')),
        initialize: function(options) {
            EmbedView.prototype.initialize.call(this, options);
        },
        render: function() {
            var embed = '';
            if (!this.info.useLegacyEmbeds()) {
                var data = {
                    modelId: this.model.get('id'),
                    width: this.getFrameWidth(),
                    height: this.getFrameHeight(),
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
                            playlistSortDirection: playlistLayout.playlistSortDirection,
                            playlistSearchString: playlistLayout.playlistSearchString,
                            playlistCategory: playlistLayout.playlistCategory,
                            playlistNumberOfResults: playlistLayout.playlistNumberOfResults
                        })
                    });
                }
                embed = this.template(data);
            } else {
                embed = this.legacyTemplate({
                    modelId: this.model.get('id'),
                    width: this.getFrameWidth(),
                    height: this.getFrameHeight(),
                    ensembleUrl: this.config.ensembleUrl
                });
            }
            this.$el.html(embed);
        }
    });

});
