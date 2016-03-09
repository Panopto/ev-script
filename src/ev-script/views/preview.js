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
            var $dialogWrap = $('<div class="dialogWrap ev-preview"></div>'),
                content = this.model.get('content') || {
                    Title: this.model.get('id')
                },
                embedSettings = new this.model.constructor(this.model.toJSON()),
                // Desired media dimensions
                mediaDims = {
                    width: this.model.get('width'),
                    height: this.model.get('height')
                },
                // Dialog dimensions TBD
                dialogDims = {},
                // Desired difference between media width and containing dialog width
                widthOffset = 50,
                // Desired difference between media height and containing dialog height
                heightOffset = this.info.useLegacyEmbeds() ? 140 : 100,
                // Used for scaling media dimensions to fit within desired dialog size
                ratio,
                // Maximum width of media based on desired dialog width
                maxWidth,
                // Maximum height of media based on desired dialog height
                maxHeight,
                // Our dialog
                $dialog;
            this.$el.after($dialogWrap);
            dialogDims.width = Math.min(mediaDims.width + widthOffset, $(window).width() - this.config.dialogMargin);
            dialogDims.height = Math.min(mediaDims.height + heightOffset, $(window).height() - this.config.dialogMargin);
            // Only bother scaling if we're dealing with videos
            if (this.model instanceof VideoSettings) {
                maxWidth = dialogDims.width - widthOffset;
                maxHeight = dialogDims.height - heightOffset;
                while (mediaDims.width > maxWidth || mediaDims.height > maxHeight) {
                    ratio = mediaDims.width > maxWidth ? maxWidth / mediaDims.width : maxHeight / mediaDims.height;
                    mediaDims.width = mediaDims.width * ratio;
                    mediaDims.height = mediaDims.height * ratio;
                }
                mediaDims.width = Math.ceil(mediaDims.width);
                mediaDims.height = Math.ceil(mediaDims.height);
            }
            embedSettings.set('width', mediaDims.width);
            embedSettings.set('height', mediaDims.height);
            $dialog = $dialogWrap.dialog({
                title: this.unencode(content.Title || content.Name),
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
