define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        BaseAuth = require('ev-script/auth/base/auth'),
        AuthView = require('ev-script/auth/basic/view'),
        Organizations = require('ev-script/collections/organizations'),
        // Note: This isn't really basic authentication at all...we just set
        // cookies containing credentials to be handled by a proxy.  The proxy
        // uses these to forward our request with a basic auth header.
        BasicAuth = BaseAuth.extend({
            constructor: function(appId) {
                BasicAuth.__super__.constructor.call(this, appId);
            },
            fetchUser: function() {
                return BasicAuth.__super__.fetchUser.call(this);
            },
            login: function(loginInfo) {
                var cookieOptions = { path: this.config.authPath };
                $.cookie(this.config.ensembleUrl + '-user', loginInfo.username, _.extend({}, cookieOptions));
                $.cookie(this.config.ensembleUrl + '-pass', loginInfo.password, _.extend({}, cookieOptions));
                return this.fetchUser();
            },
            logout: function() {
                var deferred = $.Deferred();
                var cookieOptions = { path: this.config.authPath };
                $.removeCookie(this.config.ensembleUrl + '-user', _.extend({}, cookieOptions));
                $.removeCookie(this.config.ensembleUrl + '-pass', _.extend({}, cookieOptions));
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                deferred.resolve();
                return deferred.promise();
            },
            handleUnauthorized: function(element, authCallback) {
                this.logout();
                var authView = new AuthView({
                    el: element,
                    submitCallback: authCallback,
                    appId: this.appId,
                    auth: this
                });
                authView.render();
            }
        });

    return BasicAuth;
});
