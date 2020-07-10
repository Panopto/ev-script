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
        logoutCallback: function() {
            log.info('[routers/auth] logoutCallback route');
            this.userManager.signoutPopupCallback();
        }
    });

});