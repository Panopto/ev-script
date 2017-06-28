define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Globalize = require('globalize'),
        BaseView = require('ev-script/views/base'),
        VideoSettings = require('ev-script/models/video-settings');

    require('jquery-ui');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            var $dialogWrap = $('<div class="dialogWrap ev-preview"></div>'),
                embedView = new this.embedClass({
                    model: new this.model.constructor(this.model.toJSON()),
                    appId: this.appId
                }),
                // Desired difference between media width and containing dialog width
                widthOffset = 50,
                // Desired difference between media height and containing dialog height
                heightOffset = this.info.useLegacyEmbeds() ? 140 : 50,
                // Actual dialog width taking into account available room
                dialogWidth = Math.min(embedView.getFrameWidth() + widthOffset, $(window).width() - this.config.dialogMargin),
                // Actual dialog height taking into account available room
                dialogHeight = Math.min(embedView.getFrameHeight() + heightOffset, $(window).height() - this.config.dialogMargin),
                // Our dialog
                $dialog;

            this.$el.after($dialogWrap);

            // Try to scale our content to fit within available dialog dimensions
            embedView.scale(dialogWidth - widthOffset, dialogHeight - heightOffset);

            $dialog = $dialogWrap.dialog({
                title: this.getTitle(),
                modal: true,
                width: dialogWidth,
                height: dialogHeight,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    embedView.render();
                    $dialogWrap.html(embedView.$el);
                }, this),
                closeText: Globalize.formatMessage('Close'),
                close: function(event, ui) {
                    $dialogWrap.dialog('destroy').remove();
                }
            });
        },
        getTitle: function() {
            var content = this.model.get('content') || {
                Title: this.model.get('id')
            };
            return this.unencode(content.Title || content.Name);
        }
    });

});
