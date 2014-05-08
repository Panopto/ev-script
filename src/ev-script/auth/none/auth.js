define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseAuth = require('ev-script/auth/base/auth'),
        AuthView = require('ev-script/auth/none/view'),
        // This auth type doesn't actually prompt to authenticate.  Rather, it
        // displays an authentication warning.
        NoneAuth = BaseAuth.extend({
            constructor: function(appId) {
                BaseAuth.prototype.constructor.call(this, appId);
            },
            handleUnauthorized: function(element, authCallback) {
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                var authView = new AuthView({
                    el: element,
                    submitCallback: authCallback,
                    appId: this.appId,
                    auth: this,
                    collection: this.identityProviders
                });
                authView.render();
            }
        });

    return NoneAuth;

});
