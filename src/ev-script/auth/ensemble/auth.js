define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseAuth = require('ev-script/auth/base/auth'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        AuthView = require('ev-script/auth/ensemble/view'),
        // This auth type renders an EV login control in an iframe
        EnsembleAuth = BaseAuth.extend({
            constructor: function(appId) {
                BaseAuth.prototype.constructor.call(this, appId);
            },
            logout: function() {
                return FormsAuth.prototype.logout.call(this);
            },
            handleUnauthorized: function(element, authCallback) {
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                var authView = new AuthView({
                    el: element,
                    submitCallback: authCallback,
                    appId: this.appId,
                    auth: this
                });
                authView.render();
            }
        });

    return EnsembleAuth;

});
