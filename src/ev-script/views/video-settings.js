define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        messages = require('i18n!ev-script/nls/messages'),
        SettingsView = require('ev-script/views/settings'),
        sizeUtil = require('ev-script/util/size');

    require('jquery-ui');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/video-settings.html')),
        legacyTemplate: _.template(require('text!ev-script/templates/video-settings-legacy.html')),
        sizesTemplate: _.template(require('text!ev-script/templates/sizes.html')),
        initialize: function(options) {
            SettingsView.prototype.initialize.call(this, options);
            this.encoding = options.encoding;
            this.encoding.on('change:id', _.bind(function() {
                this.render();
            }, this));
        },
        updateModel: function() {
            var attrs = {
                'showtitle': this.$('#showtitle').is(':checked'),
                'autoplay': this.$('#autoplay').is(':checked'),
                'showcaptions': this.$('#showcaptions').is(':checked'),
                'hidecontrols': this.$('#hidecontrols').is(':checked')
            };
            if (!this.info.useLegacyEmbeds()) {
                attrs = _.extend(attrs, {
                    'socialsharing': this.$('#socialsharing').is(':checked'),
                    'annotations': this.$('#annotations').is(':checked'),
                    'captionsearch': this.$('#captionsearch').is(':checked'),
                    'attachments': this.$('#attachments').is(':checked'),
                    'audiopreviewimage': this.$('#audiopreviewimage').is(':checked'),
                    'links': this.$('#links').is(':checked'),
                    'metadata': this.$('#metadata').is(':checked'),
                    'dateproduced': this.$('#dateproduced').is(':checked'),
                    'embedcode': this.$('#embedcode').is(':checked'),
                    'download': this.$('#download').is(':checked')
                });
            }
            var sizeVal = this.$('#size').val();
            if (!sizeVal || sizeVal === 'original') {
                // isNew signifies that the encoding hasn't been fetched yet
                if (this.encoding && !this.encoding.isNew()) {
                    _.extend(attrs, {
                        width: this.encoding.getWidth(),
                        height: this.encoding.getHeight()
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
                ratio = 16 / 9,
                options = [];
            if (width && height) {
                ratio = width / height;
            } else if (this.encoding.id) {
                width = this.encoding.getWidth();
                height = this.encoding.getHeight();
                ratio = this.encoding.getRatio();
            }
            options = sizeUtil.getAvailableDimensions(ratio);
            this.$('.size').append(this.sizesTemplate({
                sizes: options,
                // Select the override or current width
                target: sizeUtil.findClosestDimension(options, this.config.defaultVideoWidth || width)
            }));
        },
        render: function() {
            var html = '';
            if (!this.info.useLegacyEmbeds()) {
                html = this.template({
                    messages: messages,
                    model: this.field.model,
                    isAudio: this.encoding && this.encoding.isAudio()
                });
            } else {
                html = this.legacyTemplate({
                    messages: messages,
                    model: this.field.model,
                    isAudio: this.encoding && this.encoding.isAudio()
                });
            }
            this.$el.html(html);
            if (this.encoding) {
                this.renderSize();
            }
            var content = this.field.model.get('content');
            this.$el.dialog({
                title: this.unencode(content ? content.Title : this.field.model.get('id')),
                modal: true,
                autoOpen: false,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                width: Math.min(680, $(window).width() - this.config.dialogMargin),
                height: Math.min(260, $(window).height() - this.config.dialogMargin)
            });
        }
    });

});
