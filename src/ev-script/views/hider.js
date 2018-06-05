define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/hider.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'hideHandler', 'logoutHandler', 'authHandler', 'render');
            this.globalEvents.on('loggedIn', this.authHandler);
            this.globalEvents.on('loggedOut', this.authHandler);
            this.field = options.field;
        },
        events: {
            'click a.action-hide': 'hideHandler',
            'click a.action-logout': 'logoutHandler'
        },
        authHandler: function(ensembleUrl) {
            if (ensembleUrl === this.config.ensembleUrl) {
                this.render();
            }
        },
        render: function() {
            var username = '';
            if (this.auth.isAuthenticated()) {
                username = this.auth.getUser().get('username');
            }
            this.$el.html(this.template({
                i18n: this.i18n,
                showLogout: this.auth.isAuthenticated(),
                username: username
            }));
        },
        hideHandler: function(e) {
            this.appEvents.trigger('hidePicker', this.field.id);
            e.preventDefault();
        },
        logoutHandler: function(e) {
            this.auth.logout().always(this.appEvents.trigger('hidePickers'));
            e.preventDefault();
        }
    });

});
