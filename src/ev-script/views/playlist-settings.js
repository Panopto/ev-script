define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        SettingsView = require('ev-script/views/settings');

    require('jquery-ui');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/playlist-settings.html')),
        initialize: function(options) {
            SettingsView.prototype.initialize.call(this, options);
        },
        updateModel: function() {
            var content = this.field.model.get('content'),
                attrs = {
                    'embedcode': content && content.IsSecure ? false : this.$('#embedcode').is(':checked'),
                    'statistics': this.$('#statistics').is(':checked'),
                    'duration': this.$('#duration').is(':checked'),
                    'attachments': this.$('#attachments').is(':checked'),
                    'annotations': this.$('#annotations').is(':checked'),
                    'links': this.$('#links').is(':checked'),
                    'credits': this.$('#credits').is(':checked'),
                    'socialsharing': content && content.IsSecure ? false : this.$('#socialsharing').is(':checked'),
                    'autoplay': this.$('#autoplay').is(':checked'),
                    'showcaptions': this.$('#showcaptions').is(':checked'),
                    'dateproduced': this.$('#dateproduced').is(':checked'),
                    'audiopreviewimage': this.$('#audiopreviewimage').is(':checked'),
                    'captionsearch': this.$('#captionsearch').is(':checked')
                };
            this.field.model.set(attrs);
        },
        render: function() {
            var content = this.field.model.get('content'),
                html = this.template({
                    model: this.field.model,
                    isAudio: this.encoding && this.encoding.isAudio(),
                    isSecure: content && content.IsSecure
                });
            this.$el.html(html);
            this.$el.dialog({
                title: this.unencode(content ? content.Name : this.field.model.get('id')),
                modal: true,
                autoOpen: false,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                width: Math.min(680, $(window).width() - this.config.dialogMargin),
                height: Math.min(280, $(window).height() - this.config.dialogMargin)
            });
        }
    });

});
