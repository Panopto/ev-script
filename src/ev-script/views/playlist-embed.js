define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/playlist-embed.html')),
        initialize: function(options) {
            EmbedView.prototype.initialize.call(this, options);
        },
        render: function(isPreview) {
            var src = URI(this.config.ensembleUrl + '/app/plugin/embed.aspx'),
                width = this.getFrameWidth(),
                height = this.getFrameHeight();
            src.addQuery({
                'DestinationID': this.model.get('id'),
                'playlistEmbed': true,
                'isNewPluginEmbed': true,
                'hideControls': true,
                'width': width,
                'height': height,
                'displayTitle': true,
                'displayEmbedCode': this.model.get('embedcode'),
                'displayStatistics': this.model.get('statistics'),
                'displayVideoDuration': this.model.get('duration'),
                'displayAttachments': this.model.get('attachments'),
                'displayAnnotations': this.model.get('annotations'),
                'displayLinks': this.model.get('links'),
                'displayCredits': this.model.get('credits'),
                'displaySharing': this.model.get('socialsharing'),
                'autoPlay': this.model.get('autoplay'),
                'showCaptions': this.model.get('showcaptions'),
                'displayDateProduced': this.model.get('dateproduced'),
                'audioPreviewImage': this.model.get('audiopreviewimage'),
                'displayCaptionSearch': this.model.get('captionsearch')
            });
            if (isPreview) {
                // Hack to bypass restrictions for preview
                src.addQuery('isPermalinkPreview', true);
            }
            if (this.info.checkVersion('>=4.8.0')) {
                src.addQuery('displayViewersReport', this.model.get('viewersreport'));
            }
            if (this.model.get('layout') === 'showcase') {
                var showcaseLayout = this.model.get('showcaseLayout');
                src.addQuery('displayShowcase', true);
                if (showcaseLayout.categoryList) {
                    src.addQuery({
                        'displayCategoryList': true,
                        'categoryOrientation': showcaseLayout.categoryOrientation
                    });
                }
            } else {
                var playlistLayout = this.model.get('playlistLayout');
                src.addQuery({
                    'orderBy': playlistLayout.playlistSortBy,
                    'orderByDirection': playlistLayout.playlistSortDirection
                });
                if (playlistLayout.playlistSearchString) {
                    src.addQuery('searchString', playlistLayout.playlistSearchString);
                }
                if (playlistLayout.playlistCategory) {
                    src.addQuery('categoryID', playlistLayout.playlistCategory);
                }
                if (playlistLayout.playlistNumberOfResults) {
                    src.addQuery('resultsCount', playlistLayout.playlistNumberOfResults);
                }
            }
            this.$el.html(this.template({
                'src': src,
                'width': width,
                'height': height
            }));
        }
    });

});
