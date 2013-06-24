define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        AuthView = require('ev-script/auth/basic/view'),
        BasicAuth = function(appId) {
            this.appId = appId;
            this.config = cacheUtil.getAppConfig(appId);
            this.globalEvents = eventsUtil.getEvents('global');
        };

    _.extend(BasicAuth.prototype, {
        // Retrieve current user id from API...don't do anything here but return
        // a resolved deferred
        fetchUserId: function() {
            return $.Deferred().resolve().promise();
        },
        getUserId: function() {
            return $.cookie(this.config.ensembleUrl + '-user');
        },
        login: function(loginInfo) {
            var deferred = $.Deferred();
            loginInfo.username += (this.config.authDomain ? '@' + this.config.authDomain : '');
            var cookieOptions = { path: this.config.authPath };
            $.cookie(this.config.ensembleUrl + '-user', loginInfo.username, _.extend({}, cookieOptions));
            $.cookie(this.config.ensembleUrl + '-pass', loginInfo.password, _.extend({}, cookieOptions));
            this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
            deferred.resolve();
            return deferred.promise();
        },
        logout: function() {
            var deferred = $.Deferred();
            var cookieOptions = { path: this.config.authPath };
            $.cookie(this.config.ensembleUrl + '-user', null, _.extend({}, cookieOptions));
            $.cookie(this.config.ensembleUrl + '-pass', null, _.extend({}, cookieOptions));
            this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
            deferred.resolve();
            return deferred.promise();
        },
        isAuthenticated: function() {
            return $.cookie(this.config.ensembleUrl + '-user') && $.cookie(this.config.ensembleUrl + '-pass');
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
