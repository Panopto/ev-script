define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events');

    require('jquery-ui/ui/widgets/dialog');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/auth/none/template.html')),
        initialize: function(options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.i18n = cacheUtil.getAppI18n(this.appId);
        },
        render: function() {
            var $html = $(this.template({
                i18n: this.i18n
            }));
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: this.i18n.formatMessage('Ensemble Video Login') + ' - ' + this.config.ensembleUrl,
                modal: true,
                draggable: false,
                resizable: false,
                width: Math.min(540, $(window).width() - this.config.dialogMargin),
                height: Math.min(250, $(window).height() - this.config.dialogMargin),
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    this.$dialog.html($html);
                }, this),
                closeText: this.i18n.formatMessage('Close'),
                close: _.bind(function(event, ui) {
                    this.$dialog.dialog('destroy').remove();
                    this.appEvents.trigger('hidePickers');
                }, this)
            });
        }
    });

});
