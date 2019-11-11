define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        SettingsView = require('ev-script/views/settings'),
        sizeUtil = require('ev-script/util/size'),
        QuizSettings = require('ev-script/models/quiz-settings');

    require('jquery-ui/ui/widgets/dialog');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/quiz-settings.html')),
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
                    'showcaptions': this.$('#showcaptions').is(':checked'),
                    'attachments': this.$('#attachments').is(':checked'),
                    'links': this.$('#links').is(':checked'),
                    'metadata': this.$('#metadata').is(':checked'),
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
                defaultQuizWidth = (new QuizSettings()).get('width'),
                targetWidth;
            if ((!width || !height) && this.encoding.id) {
                width = this.encoding.getWidth();
                height = this.encoding.getHeight();
            }
            // Use default IF encoding can handle it
            if (defaultQuizWidth <= width) {
                targetWidth =  defaultQuizWidth;
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
                model: this.field.model
            }));
            if (this.encoding) {
                this.renderSize();
            }
            var content = this.field.model.get('content');
            this.$el.dialog({
                title: this.unencode(content && content.title || this.field.model.get('id')),
                modal: true,
                autoOpen: false,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                width: Math.min(680, $(window).width() - this.config.dialogMargin),
                height: Math.min(300, $(window).height() - this.config.dialogMargin),
                closeText: this.i18n.formatMessage('Close')
            });
        }
    });

});
