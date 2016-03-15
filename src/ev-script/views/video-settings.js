define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        SettingsView = require('ev-script/views/settings');

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
                options = ['1280x720', '1024x576', '848x480', '720x405', '640x360', '610x344', '560x315', '480x270', '400x225', '320x180', '240x135', '160x90'];
            if (width && height) { 
               ratio = width / height;
            } else if (this.encoding.id) {
                width = this.encoding.getWidth();
                height = this.encoding.getHeight();
                ratio = this.encoding.getRatio();
            }
            // Use a fuzz factor to determine ratio equality since our sizes are not always accurate
            if (Math.ceil(ratio * 10) / 10 === Math.ceil((4 / 3) * 10) / 10) {
                options = ['1280x960', '1024x770', '848x636', '720x540', '640x480', '610x460', '560x420', '480x360', '400x300', '320x240', '240x180', '160x120'];
            }
            var size = width + 'x' + height;
            if (this.config.defaultVideoWidth) {
                // Find the first available option that matches our desired width
                var override = _.find(options, _.bind(function(option) { return new RegExp('^' + this.config.defaultVideoWidth).test(option); }, this));
                size = override || size;
            }
            this.$('.size').append(this.sizesTemplate({
                sizes: options,
                target: size
            }));
        },
        render: function() {
            var html = '';
            if (!this.info.useLegacyEmbeds()) {
                html = this.template({
                    model: this.field.model,
                    isAudio: this.encoding && this.encoding.isAudio()
                });
            } else {
                html = this.legacyTemplate({
                    model: this.field.model,
                    isAudio: this.encoding && this.encoding.isAudio()
                });
            }
            this.$el.html(html);
            if (this.encoding && !this.encoding.isAudio()) {
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
                height: Math.min(220, $(window).height() - this.config.dialogMargin)
            });
        }
    });

});
