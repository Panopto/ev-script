define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/hider.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'hideHandler', 'logoutHandler', 'authHandler', 'render');
            this.globalEvents.on('authSet', this.authHandler);
            this.globalEvents.on('authRemoved', this.authHandler);
            this.field = options.field;
        },
        events: {
            'click a.action-hide': 'hideHandler',
            'click a.action-logout': 'logoutHandler'
        },
        authHandler: function(authId) {
            if (authId === this.config.authId) {
                this.render();
            }
        },
        render: function() {
            this.$el.html(this.template({
                hasAuth: this.hasAuth()
            }));
        },
        hideHandler: function(e) {
            this.appEvents.trigger('hidePicker', this.field.id);
            e.preventDefault();
        },
        logoutHandler: function(e) {
            this.removeAuth();
            this.appEvents.trigger('hidePickers');
            e.preventDefault();
        }
    });

});
