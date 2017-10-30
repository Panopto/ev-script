define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URI = require('urijs/URI'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events');

    require('jquery-ui/ui/widgets/dialog');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/auth/ensemble/template.html')),
        initialize: function(options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.globalEvents = eventsUtil.getEvents('global');
            this.i18n = cacheUtil.getAppI18n(this.appId);
            this.submitCallback = options.submitCallback || function() {};
        },
        render: function() {
            var dialogWidth = Math.min(540, $(window).width() - this.config.dialogMargin),
                dialogHeight = Math.min(250, $(window).height() - this.config.dialogMargin),
                frameSrc = URI(this.config.ensembleUrl)
                    .path(this.config.ensembleAuthOptions.authPath)
                    .addQuery('idp', this.config.defaultProvider),
                $html = $(this.template({
                    i18n: this.i18n,
                    frameSrc: frameSrc,
                    frameWidth: dialogWidth - 50,
                    frameHeight: dialogHeight - 60
                }));
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: this.i18n.formatMessage('Ensemble Video Login') + ' - ' + this.config.ensembleUrl,
                modal: true,
                draggable: false,
                resizable: false,
                width: dialogWidth,
                height: dialogHeight,
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
            $(window).on('message', _.bind(function(e) {
                if (e.originalEvent.data === this.config.ensembleAuthOptions.authCompleteMessage) {
                    this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
                    this.$dialog.dialog('destroy').remove();
                    this.submitCallback();
                }
            }, this));
        }
    });

});
