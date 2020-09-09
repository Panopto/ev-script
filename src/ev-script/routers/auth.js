define(function(require) {

    'use strict';

    var _ = require('underscore'),
        log = require('loglevel'),
        Backbone = require('backbone');

    return Backbone.Router.extend({
        initialize: function(options) {
            _.bindAll(this, 'default', 'popupCallback', 'silentCallback',
                'logoutCallback');
            this.userManager = options.userManager;
            this.defaultCallback = options.defaultCallback || function() {};
            this.config = options.config;
        },
        routes: {
            '': 'default',
            'auth/popupCallback': 'popupCallback',
            'auth/silentCallback': 'silentCallback',
            'auth/redirectCallback': 'redirectCallback',
            'auth/logoutCallback': 'logoutCallback'
        },
        default: function() {
            log.info('[routers/auth] default route');
            this.defaultCallback();
        },
        popupCallback: function() {
            log.info('[routers/auth] popupCallback route');
            this.userManager.signinPopupCallback();
        },
        silentCallback: function() {
            log.info('[routers/auth] silentCallback route');
            this.userManager.signinSilentCallback();
        },
        redirectCallback: function() {
            log.info('[routers/auth] redirectCallback route');
            this.userManager.signinRedirectCallback()
            .then(_.bind(function(user) {
                this.navigate('');
                this.config.currentUserId = user.profile.sub;
                this.config.state = user.state;
                this.default();
            }, this));
        },
        logoutCallback: function() {
            log.info('[routers/auth] logoutCallback route');
            if (this.config.useAuthRedirect) {
                this.userManager.signoutRedirectCallback()
                .then(_.bind(function(user) {
                    this.navigate('');
                    this.config.currentUserId = undefined;
                    this.default();
                }, this));
            } else {
                this.userManager.signoutPopupCallback();
            }
        }
    });

});