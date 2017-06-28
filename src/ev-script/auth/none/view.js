define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        Globalize = require('globalize'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events');

    require('jquery-ui');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/auth/none/template.html')),
        initialize: function(options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
        },
        render: function() {
            var $html = $(this.template({
                Globalize: Globalize
            }));
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: Globalize.formatMessage('Ensemble Video Login') + ' - ' + this.config.ensembleUrl,
                modal: true,
                draggable: false,
                resizable: false,
                width: Math.min(540, $(window).width() - this.config.dialogMargin),
                height: Math.min(250, $(window).height() - this.config.dialogMargin),
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    this.$dialog.html($html);
                }, this),
                closeText: Globalize.formatMessage('Close'),
                close: _.bind(function(event, ui) {
                    this.$dialog.dialog('destroy').remove();
                    this.appEvents.trigger('hidePickers');
                }, this)
            });
        }
    });

});
