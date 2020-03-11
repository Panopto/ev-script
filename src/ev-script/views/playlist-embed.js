define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        fixedTemplate: _.template(require('text!ev-script/templates/playlist-embed-fixed.html')),
        responsiveTemplate: _.template(require('text!ev-script/templates/playlist-embed-responsive.html')),
        initialize: function(options) {
            EmbedView.prototype.initialize.call(this, options);
        },
        render: function(isPreview) {
            var src = URI(this.config.ensembleUrl + '/hapi/v1/ui/Playlists/' + this.model.get('id') + '/Plugin'),
                layout = this.model.get('layout'),
                embedType = this.model.get('embedtype'),
                width,
                height,
                embed;

            src.addQuery({
                'isPreview': isPreview,
                'layout': layout,
                'sortBy': this.model.get('sortby'),
                'desc': this.model.get('desc'),
                'search': this.model.get('search'),
                'categories': this.model.get('categories'),
                'resultsCount': this.model.get('resultscount'),
                'displayTitle': true,
                'displayEmbedCode': this.model.get('embedcode'),
                'displayVideoDuration': this.model.get('duration'),
                'displayAttachments': this.model.get('attachments'),
                'displayAnnotations': this.model.get('annotations'),
                'displayLinks': this.model.get('links'),
                'displayCredits': this.model.get('credits'),
                'displaySharing': this.model.get('socialsharing'),
                'displayCopyUrl': this.model.get('socialsharing'),
                'autoPlay': this.model.get('autoplay'),
                'showCaptions': this.model.get('showcaptions'),
                'displayDateProduced': this.model.get('dateproduced'),
                'audioPreviewImage': this.model.get('audiopreviewimage'),
                'displayCaptionSearch': this.model.get('captionsearch'),
                'displayViewersReport': this.model.get('viewersreport'),
                'displayAxdxs' : this.model.get('axdxs'),
                'displayNextUp': this.model.get('nextup'),
                'featuredContentId': this.model.get('featuredcontentid')
            });

            if (embedType === 'fixed') {
                width = this.getFrameWidth();
                height = this.getFrameHeight();
                embed = this.fixedTemplate({
                    'src': src,
                    'width': width,
                    'height': height
                });
            } else if (embedType === 'responsive') {
                embed = this.responsiveTemplate({
                    'src': src
                });
            }

            this.$el.html(embed);
        }
    });

});
