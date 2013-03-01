/*global window*/
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
            var $dialogWrap = $('<div class="dialogWrap"></div>');
            this.$el.after($dialogWrap);
            var content = this.model.get('content');
            var width = this.model.get('width');
            width = (width ? width : (this.model instanceof VideoSettings ? 640 : 800));
            var height = this.model.get('height');
            height = (height ? height : (this.model instanceof VideoSettings ? 360 : 850));
            var embedSettings = new this.model.constructor(this.model.toJSON());
            var dialogWidth = width + 50;
            var dialogHeight = height + 140;
            var maxWidth = $(window).width() - 20;
            // Contain preview within window
            if (dialogWidth > maxWidth) {
                var origWidth = dialogWidth;
                dialogWidth = maxWidth;
                var ratio = maxWidth / origWidth;
                embedSettings.set('width', width * ratio);
                dialogHeight = dialogHeight * ratio;
                embedSettings.set('height', height * ratio);
            }
            $dialogWrap.dialog({
                title: content.Title || content.Name,
                modal: true,
                width: dialogWidth,
                height: dialogHeight,
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
