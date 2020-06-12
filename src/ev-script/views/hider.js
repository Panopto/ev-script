define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/hider.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'hideHandler', 'logoutHandler', 'authHandler', 'render');
            this.events.on('loggedIn', this.authHandler);
            this.events.on('loggedOut', this.authHandler);
            this.field = options.field;
        },
        events: {
            'click a.action-hide': 'hideHandler',
            'click a.action-logout': 'logoutHandler'
        },
        authHandler: function() {
            this.render();
        },
        render: function() {
            this.root.promise.always(_.bind(function() {
                var user = this.root.getUser(),
                    username = user && user.get('username') || '';
                this.$el.html(this.template({
                    i18n: this.i18n,
                    showLogout: user,
                    username: username,
                    enableHide: this.config.hidePickers
                }));
            }, this));
        },
        hideHandler: function(e) {
            this.events.trigger('hidePicker', this.field.id);
            e.preventDefault();
        },
        logoutHandler: function(e) {
            this.auth.logout()
            .then(_.bind(function() {
                this.events.trigger('hidePickers');
            }, this));
            e.preventDefault();
        }
    });

});
