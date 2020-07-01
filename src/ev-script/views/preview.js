define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        VideoSettings = require('ev-script/models/video-settings');

    require('jquery-ui/ui/widgets/dialog');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            _.bindAll(this, 'render', 'getTitle');

            this.render();
        },
        render: function() {
            var $dialogWrap = $('<div class="dialogWrap ev-preview"></div>'),
                embedView = new this.embedClass({
                    model: new this.model.constructor(this.model.toJSON()),
                    config: this.config
                }),
                // Desired difference between media width and containing dialog width
                widthOffset = 50,
                // Desired difference between media height and containing dialog height
                heightOffset = 70,
                // Actual dialog width taking into account available room
                dialogWidth = Math.min(parseInt(embedView.getFrameWidth(), 10) + widthOffset, $(window).width() - this.config.dialogMargin),
                // Actual dialog height taking into account available room
                dialogHeight = Math.min(parseInt(embedView.getFrameHeight(), 10) + heightOffset, $(window).height() - this.config.dialogMargin),
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
                    embedView.render(true);
                    // Add autofocus attribute to embed view iframe
                    embedView.$('iframe').attr('autofocus', true);
                    $dialogWrap.html(embedView.$el);
                }, this),
                closeText: this.i18n.formatMessage('Close'),
                close: function(event, ui) {
                    $dialogWrap.dialog('destroy').remove();
                }
            });
        },
        getTitle: function() {
            return this.unencode(this.model.get('content').title);
        }
    });

});
