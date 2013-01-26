/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            this.app = options.app;
            this.submitCallback = options.submitCallback || function() {};
            var html =
                '<div class="logo"></div>' +
                '<form>' +
                '  <fieldset>' +
                '    <div class="fieldWrap">' +
                '      <label for="username">Username</label>' +
                '      <input id="username" name="username" class="form-text"type="text"/>' +
                '    </div>' +
                '    <div class="fieldWrap">' +
                '      <label for="password">Password</label>' +
                '      <input id="password" name="password" class="form-text"type="password"/>' +
                '    </div>' +
                '    <div class="form-actions">' +
                '      <input type="submit" class="form-submit action-submit" value="Submit"/>' +
                '    </div>' +
                '  </fieldset>' +
                '</form>';
            this.$dialog = $('<div class="ev-auth"></div>');
            this.$el.after(this.$dialog);
            this.$dialog.dialog({
                title: 'Ensemble Video Login - ' + this.app.config.ensembleUrl,
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
                    this.app.eventAggr.trigger('hidePickers');
                }, this)
            });
            $('form', this.$dialog).submit(_.bind(function(e) {
                var $form = $(e.target);
                var username = $('#username', $form).val();
                var password = $('#password', $form).val();
                if (username && password) {
                    this.app.auth.setAuth(username, password);
                    this.$dialog.dialog('destroy').remove();
                    this.submitCallback();
                }
                e.preventDefault();
            }, this));
        }
    });

});
