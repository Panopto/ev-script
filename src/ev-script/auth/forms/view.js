/*global window*/
define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events');

    require('jquery.cookie');
    require('jquery-ui');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/auth/forms/template.html')),
        optionsTemplate: _.template(require('text!ev-script/templates/options.html')),
        initialize: function(options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.submitCallback = options.submitCallback || function() {};
            this.auth = options.auth;
        },
        render: function() {
            var $html = $(this.template());
            var $select = $('#domain', $html).append(this.optionsTemplate({
                collection: this.collection,
                // FIXME - need to know the default to select here
                selectedId: null
            }));
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: 'Ensemble Video Login - ' + this.config.ensembleUrl,
                modal: true,
                draggable: false,
                resizable: false,
                width: Math.min(540, $(window).width() - this.config.dialogMargin),
                height: Math.min(250, $(window).height() - this.config.dialogMargin),
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    this.$dialog.html($html);
                }, this),
                close: _.bind(function(event, ui) {
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
                        authSourceId: $('#domain :selected', $form).val(),
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
