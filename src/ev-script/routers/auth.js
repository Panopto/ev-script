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
        },
        routes: {
            '': 'default',
            'auth/popupCallback': 'popupCallback',
            'auth/silentCallback': 'silentCallback',
            'auth/logoutCallback': 'logoutCallback'
        },
        default: function() {
            this.defaultCallback();
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