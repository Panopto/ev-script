define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        SettingsView = require('ev-script/views/settings'),
        sizeUtil = require('ev-script/util/size');

    require('jquery-ui/ui/widgets/dialog');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/dropbox-settings.html')),
        updateModel: function() {
            var attrs = {
                'width': parseInt(this.$('#width').val(), 10) || this.field.model.get('width'),
                'height': parseInt(this.$('#height').val(), 10) || this.field.model.get('height')
            };

            this.field.model.set(attrs);
        },
        render: function() {
            this.$el.html(this.template({
                appInfo: this.info,
                i18n: this.i18n,
                model: this.field.model
            }));

            var content = this.field.model.get('content');
            this.$el.dialog({
                title: this.unencode(content ? content.title : this.field.model.get('id')),
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
