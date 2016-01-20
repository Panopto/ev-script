define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        VideoSettings = require('ev-script/models/video-settings');

    require('jquery-ui');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            var $dialogWrap = $('<div class="dialogWrap"></div>'),
                content = this.model.get('content') || {
                    Title: this.model.get('id')
                },
                embedSettings = new this.model.constructor(this.model.toJSON()),
                // Desired media dimensions
                mediaDims = {
                    width: this.model.get('width') || (this.model instanceof VideoSettings ? 640 : 800),
                    height: this.model.get('height') || (this.model instanceof VideoSettings ? 360 : 850)
                },
                // Dialog dimensions TBD
                dialogDims = {},
                // Desired difference between media width and containing dialog width
                widthOffset = 50,
                // Desired difference between media height and containing dialog height
                heightOffset = 140,
                // Used for scaling media dimensions to fit within desired dialog size
                ratio,
                // Maximum width of media based on desired dialog width
                maxWidth,
                // Our dialog
                $dialog;
            this.$el.after($dialogWrap);
            dialogDims.width = Math.min(mediaDims.width + widthOffset, $(window).width() - this.config.dialogMargin);
            dialogDims.height = Math.min(mediaDims.height + heightOffset, $(window).height() - this.config.dialogMargin);
            maxWidth = dialogDims.width - widthOffset;
            // Only bother scaling if we're dealing with videos and if width is
            // too big
            if (this.model instanceof VideoSettings && mediaDims.width > maxWidth) {
                ratio = maxWidth / mediaDims.width;
                mediaDims.width = mediaDims.width * ratio;
                mediaDims.height = mediaDims.height * ratio;
            }
            embedSettings.set('width', mediaDims.width);
            embedSettings.set('height', mediaDims.height);
            $dialog = $dialogWrap.dialog({
                title: content.Title || content.Name,
                modal: true,
                width: dialogDims.width,
                height: dialogDims.height,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    var embedView = new this.embedClass({
                        model: embedSettings,
                        appId: this.appId
                    });
                    $dialogWrap.html(embedView.$el);
                }, this),
                close: function(event, ui) {
                    $dialogWrap.dialog('destroy').remove();
                }
            });
        }
    });

});
