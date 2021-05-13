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

            _.bindAll(this, 'render', 'getUrl');
        },
        getUrl: function(isPreview) {
            var target = this.config.ensembleUrl + '/hapi/v1/ui/Playlists/' + this.model.get('id') + '/Plugin',
                src = URI(target),
                layout = this.model.get('layout'),
                embedType = this.model.get('embedtype'),
                categories = this.model.get('categories');

            if (isPreview) {
                target += '/preview';
                src = URI(target);
            }

            src.addQuery({
                'isPreview': Boolean(isPreview),
                'layout': layout,
                'search': this.model.get('search'),
                'categories': categories === '-1' ? '' : categories,
                'resultsCount': this.model.get('resultscount'),
                'featuredContentId': this.model.get('featuredcontentid'),
                'displayTitle': true,
                'displayLogo': this.model.get('logo'),
                'displayEmbedCode': this.model.get('embedcode'),
                'displayAttachments': this.model.get('attachments'),
                'displayNotes': this.model.get('notes'),
                'displayLinks': this.model.get('links'),
                'displaySharing': this.model.get('socialsharing'),
                'displayCopyUrl': this.model.get('socialsharing'),
                'autoPlay': this.model.get('autoplay'),
                'displayComments': this.model.get('comments'),
                'showCaptions': this.model.get('showcaptions'),
                'displayMetadata': this.model.get('metadata'),
                'displayCaptionSearch': this.model.get('captionsearch'),
                'audioPreviewImage': this.model.get('audiopreviewimage'),
                'displayViewersReport': this.model.get('viewersreport'),
                'displayAxdxs': this.model.get('axdxs'),
                'isResponsive': embedType === 'responsive'
            });

            if (this.model.get('sortby') === 'CustomPosition') {
                src.addQuery({
                    'customOrderIdentifier': this.model.get('customorder')
                });
            } else {
                src.addQuery({
                    'sortBy': this.model.get('sortby'),
                    'desc': this.model.get('desc')
                });
            }

            return src.toString();
        },
        render: function(isPreview) {
            var src = this.getUrl(isPreview),
                embedType = this.model.get('embedtype'),
                width,
                height,
                embed;

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
                    'elementId': 'pl-wrapper-' + this.model.get('id'),
                    'src': src,
                    'wrapstyle': this.model.get('wrapstyle'),
                    'wrapscript': this.model.get('wrapscript'),
                    'jswrapper': this.model.get('jswrapper')
                });
            }

            this.$el.html(embed);
        }
    });

});
