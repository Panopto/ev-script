define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseAuth = require('ev-script/auth/base/auth'),
        AuthView = require('ev-script/auth/ensemble/view'),
        // This auth type renders an EV login control in an iframe
        EnsembleAuth = BaseAuth.extend({
            constructor: function(appId) {
                BaseAuth.prototype.constructor.call(this, appId);
            },
            // TODO - logout is called by hider
            // logout: function() {
            //     // TODO
            //     window.alert('FIXME');
            // },
            handleUnauthorized: function(element) {
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                var authView = new AuthView({
                    el: element,
                    submitCallback: this.authCallback,
                    appId: this.appId,
                    auth: this
                });
                authView.render();
            },
            authCallback: function() {
                this.root.fetch();
                BaseAuth.prototype.authCallback.call(this);
            }
        });

    return EnsembleAuth;

});
