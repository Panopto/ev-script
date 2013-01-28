/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
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
            var html = '<a class="action-hide" href="#" title="Hide Picker">Hide</a>' + (this.hasAuth() ? '<a class="action-logout" href="#" title="Logout">Logout</a>' : '');
            this.$el.html(html);
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
