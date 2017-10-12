define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events');

    require('jquery.cookie');
    require('jquery-ui/ui/widgets/dialog');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/auth/forms/template.html')),
        optionsTemplate: _.template(require('text!ev-script/templates/options.html')),
        initialize: function(options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.i18n = cacheUtil.getAppI18n(this.appId);
            this.submitCallback = options.submitCallback || function() {};
            this.auth = options.auth;
        },
        render: function() {
            var $html = $(this.template({
                    i18n: this.i18n
                })),
                $select = $('#provider', $html).append(this.optionsTemplate({
                    collection: this.collection,
                    selectedId: this.config.defaultProvider
                }));
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);

            // Handle loading indicator in form
            var $loader = $('div.loader', $html),
                loadingOn = _.bind(function(e, xhr, settings) {
                    $loader.addClass('loading');
                }, this),
                loadingOff = _.bind(function(e, xhr, settings) {
                    $loader.removeClass('loading');
                }, this);
            $(window.document).on('ajaxSend', loadingOn).on('ajaxComplete', loadingOff);

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
                    $(window.document).off('ajaxSend', loadingOn).off('ajaxComplete', loadingOff);
                    this.$dialog.dialog('destroy').remove();
                    this.appEvents.trigger('hidePickers');
                }, this)
            });
            $('form', this.$dialog).submit(_.bind(function(e) {
                var $form = $(e.target);
                var username = $('#username', $form).val();
                var password = $('#password', $form).val();
                if (username && password) {
                    this.auth.login({
                        username: username,
                        password: password,
                        authSourceId: $('#provider :selected', $form).val(),
                        persist: $('#remember', $form).is(':checked')
                    }).then(_.bind(function() {
                        this.$dialog.dialog('destroy').remove();
                        this.submitCallback();
                    }, this));
                }
                e.preventDefault();
            }, this));
        }
    });

});
