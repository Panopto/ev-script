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
            _.bindAll(this, 'changeLayout', 'changeCategoryList');
        },
        events: {
            'submit': 'submitHandler',
            'click input.action-cancel': 'cancelHandler',
            'change input[name="layout"]': 'changeLayout',
            'change input[name="categoryList"]': 'changeCategoryList'
        },
        updateModel: function() {
            var content = this.field.model.get('content'),
                attrs = {
                    'layout': this.$('input[name="layout"]:checked').val(),
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
            if (attrs.layout === 'playlist') {
                attrs.playlistLayout = {
                    playlistSortBy: this.$('#playlistSortBy option:selected').val(),
                    playlistSortDirection: this.$('input[name="playlistSortDirection"]:checked').val()
                };
            } else {
                attrs.showcaseLayout = {
                    // featuredContent: this.$('#featuredContent').is(':checked')
                    categoryList: this.$('#categoryList').is(':checked'),
                    categoryOrientation: this.$('input[name="categoryOrientation"]:checked').val()
                };
            }
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
            this.$('.accordion').accordion({
                active: 2,
                heightStyle: 'content',
                collapsible: true
            });
            this.$el.dialog({
                title: this.unencode(content ? content.Name : this.field.model.get('id')),
                modal: true,
                autoOpen: false,
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                width: Math.min(680, $(window).width() - this.config.dialogMargin),
                height: Math.min(400, $(window).height() - this.config.dialogMargin)
            });
        },
        changeLayout: function(e) {
            if (e.currentTarget.value === 'playlist') {
                this.$('.playlistOptions').show();
                this.$('.showcaseOptions').hide();
            } else {
                this.$('.playlistOptions').hide();
                this.$('.showcaseOptions').show();
            }
        },
        changeCategoryList: function(e) {
            if ($(e.currentTarget).is(':checked')) {
                this.$('#categoryOrientationHorizontal').attr('disabled', false);
                this.$('#categoryOrientationVertical').attr('disabled', false);
            } else {
                this.$('#categoryOrientationHorizontal').attr('disabled', true);
                this.$('#categoryOrientationVertical').attr('disabled', true);
            }
        }
    });

});
