define(function(require) {

    'use strict';

    var _ = require('underscore'),
        log = require('loglevel'),
        URI = require('urijs/URI'),
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
                var route = URI('').search(user.state).toString();
                this.navigate(route);
                if (this.config.redirectCallback) {
                    this.config.redirectCallback(user.state);
                }
                this.config.currentUserId = user.profile.sub;
                this.default();
            }, this));
        },
        logoutCallback: function() {
            log.info('[routers/auth] logoutCallback route');
            if (this.config.useAuthRedirect) {
                this.userManager.signoutRedirectCallback()
                .then(_.bind(function(resp) {
                    var route = URI('').search(resp.state).toString();
                    this.navigate(route);
                    if (this.config.redirectCallback) {
                        this.config.redirectCallback(resp.state);
                    }
                    this.config.currentUserId = undefined;
                    this.default();
                }, this));
            } else {
                this.userManager.signoutPopupCallback();
            }
        }
    });

});