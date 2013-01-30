/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/hider.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'hideHandler', 'logoutHandler', 'authHandler', 'render');
            this.picker = options.picker;
            this.globalEvents.bind('authSet', this.authHandler);
            this.globalEvents.bind('authRemoved', this.authHandler);
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
            this.picker.hidePicker();
            e.preventDefault();
        },
        logoutHandler: function(e) {
            this.removeAuth();
            e.preventDefault();
        }
    });

});
