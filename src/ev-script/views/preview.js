/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        VideoSettings = require('ev-script/models/video-settings');

    return Backbone.View.extend({
        initialize: function(options) {
            this.app = options.app;
            var $dialogWrap = $('<div class="dialogWrap"></div>');
            this.$el.after($dialogWrap);
            var content = this.model.get('content');
            var width = this.model.get('width');
            width = (width ? width : (this.model instanceof VideoSettings ? '640' : '800'));
            var height = this.model.get('height');
            height = (height ? height : (this.model instanceof VideoSettings ? '360' : '850'));
            $dialogWrap.dialog({
                title: content.Title || content.Name,
                modal: true,
                width: (parseInt(width, 10) + 50),
                height: (parseInt(height, 10) + 140),
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    var embedView = new this.embedClass({
                        model: this.model,
                        app: this.app
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
