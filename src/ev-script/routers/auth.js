define(function(require) {

    'use strict';

    var _ = require('underscore'),
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
            'auth/redirectCallback': 'redirectCallback',
            'auth/popupCallback': 'popupCallback',
            'auth/silentCallback': 'silentCallback',
            'auth/logoutCallback': 'logoutCallback'
        },
        default: function() {
            this.defaultCallback();
        },
        redirectCallback: function() {
            this.userManager.signinRedirectCallback()
            .then(_.bind(function() {
                window.location = window.location.origin + this.config.appRoot;
            }, this));
        },
        popupCallback: function() {
            this.userManager.signinPopupCallback();
        },
        silentCallback: function() {
            this.userManager.signinSilentCallback();
        },
        logoutCallback: function() {
            this.userManager.signoutPopupCallback();
        }
    });

});