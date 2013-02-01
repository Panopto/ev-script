/*global define*/
define(function(require, template) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        configUtil = require('ev-script/util/config'),
        eventsUtil = require('ev-script/util/events'),
        authUtil = require('ev-script/util/auth');

    require('jquery.cookie');
    require('jquery-ui');

    return Backbone.View.extend({
        template: _.template(require('text!ev-script/templates/auth.html')),
        initialize: function(options) {
            this.appId = options.appId;
            this.config = configUtil.getConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.submitCallback = options.submitCallback || function() {};
            var html = this.template();
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: 'Ensemble Video Login - ' + this.config.ensembleUrl,
                modal: true,
                draggable: false,
                resizable: false,
                width: 540,
                height: 250,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    this.$dialog.html(html);
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
                    authUtil.setAuth(this.config.authId, this.config.authDomain, this.config.authPath, username, password);
                    this.$dialog.dialog('destroy').remove();
                    this.submitCallback();
                }
                e.preventDefault();
            }, this));
        }
    });

});
