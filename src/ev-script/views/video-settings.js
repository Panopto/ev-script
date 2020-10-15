define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        SettingsView = require('ev-script/views/settings'),
        sizeUtil = require('ev-script/util/size'),
        VideoSettings = require('ev-script/models/video-settings');

    require('jquery-ui/ui/widgets/dialog');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/video-settings.html')),
        sizesTemplate: _.template(require('text!ev-script/templates/sizes.html')),
        initialize: function(options) {
            SettingsView.prototype.initialize.call(this, options);
            this.encoding = options.encoding;
            this.encoding.on('change:id', _.bind(function() {
                this.render();
            }, this));
        },
        checkboxHandler: function(e) {
            var $checkbox = $(e.currentTarget);
            if (($checkbox.is('#axdxs') || $checkbox.is('#embedthumbnail')) &&
                $checkbox.is(':checked')) {
                this.$('#audiopreviewimage').prop('checked', true);
                return;
            }
            if ($checkbox.is('#audiopreviewimage') && !$checkbox.is(':checked')) {
                this.$('#axdxs').prop('checked', false);
                this.$('#embedthumbnail').prop('checked', false);
                return;
            }
        },
        updateModel: function() {
            var attrs = {
                    'showtitle': this.$('#showtitle').is(':checked'),
                    'autoplay': this.$('#autoplay').is(':checked'),
                    'showcaptions': this.$('#showcaptions').is(':checked'),
                    'hidecontrols': this.$('#hidecontrols').is(':checked'),
                    'socialsharing': this.$('#socialsharing').is(':checked'),
                    'annotations': this.$('#annotations').is(':checked'),
                    'captionsearch': this.$('#captionsearch').is(':checked'),
                    'attachments': this.$('#attachments').is(':checked'),
                    'audiopreviewimage': this.$('#audiopreviewimage').is(':checked'),
                    'links': this.$('#links').is(':checked'),
                    'metadata': this.$('#metadata').is(':checked'),
                    'dateproduced': this.$('#dateproduced').is(':checked'),
                    'embedcode': this.$('#embedcode').is(':checked'),
                    'download': this.$('#download').is(':checked'),
                    'viewersreport': this.$('#viewersreport').is(':checked'),
                    'axdxs': this.$('#axdxs').is(':checked'),
                    'embedthumbnail': this.$('#embedthumbnail').is(':checked'),
                    'embedtype': this.$('#embedtype').val()
                },
                sizeVal = this.$('#size').val(),
                original = sizeVal === 'original';

            if (!sizeVal || original) {
                // isNew signifies that the encoding hasn't been fetched yet
                if (this.encoding && !this.encoding.isNew()) {
                    _.extend(attrs, {
                        width: this.encoding.getWidth(original),
                        height: this.encoding.getHeight(original)
                    });
                }
            } else {
                var dims = sizeVal.split('x');
                _.extend(attrs, {
                    width: parseInt(dims[0], 10),
                    height: parseInt(dims[1], 10)
                });
            }

            this.field.model.set(attrs);
        },
        renderSize: function() {
            var width = this.field.model.get('width'),
                height = this.field.model.get('height'),
                options = [],
                defaultVideoWidth = (new VideoSettings()).get('width'),
                targetWidth;
            if ((!width || !height) && this.encoding.id) {
                width = this.encoding.getWidth();
                height = this.encoding.getHeight();
            }
            // Use default IF encoding can handle it
            if (defaultVideoWidth <= width) {
                targetWidth =  defaultVideoWidth;
            } else {
                targetWidth = width;
            }
            options = sizeUtil.getAvailableDimensions();
            this.$('.size').append(this.sizesTemplate({
                sizes: options,
                // Select the override or current width
                target: sizeUtil.findClosestDimension(targetWidth)
            }));
        },
        render: function() {
            this.$el.html(this.template({
                appInfo: this.info,
                i18n: this.i18n,
                model: this.field.model,
                isAudio: this.encoding && this.encoding.isAudio(),
                isGallery: this.encoding && this.encoding.isGallery(),
                isYouTube: this.encoding && this.encoding.isYouTube(),
                isExternal: this.encoding && this.encoding.isExternal()
            }));
            if (this.encoding) {
                this.renderSize();
            }
            var content = this.field.model.get('content');
            this.$el.dialog({
                title: this.unencode(content ? content.name : this.field.model.get('id')),
                modal: true,
                autoOpen: false,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                width: Math.min(680, $(window).width() - this.config.dialogMargin),
                height: Math.min(340, $(window).height() - this.config.dialogMargin),
                closeText: this.i18n.formatMessage('Close')
            });
        }
    });

});
