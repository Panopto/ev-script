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
                // Hack to handle legacy (pre-3.6) API which doesn't have a
                // currentUser endpoint.  See if we can successfully query orgs
                // instead (probably least expensive due to minimal data) to see
                // if valid credentials are set, then use a randomly generated
                // user id
                if (this.info.get('ApplicationVersion')) {
                    return BasicAuth.__super__.fetchUser.call(this);
                } else {
                    var orgs = new Organizations({}, {
                        appId: this.appId
                    });
                    // Don't want special treatment of failure due to
                    // authentication in this case
                    orgs.requiresAuth = false;
                    return orgs.fetch({
                        success: _.bind(function(collection, response, options) {
                            this.user = new Backbone.Model({
                                id: Math.floor(Math.random() * 10000000000000001).toString(16)
                            });
                            this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
                        }, this),
                        error: _.bind(function(collection, xhr, options) {
                            this.user = null;
                            this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                        }, this)
                    }).promise();
                }
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
                $.cookie(this.config.ensembleUrl + '-user', null, _.extend({}, cookieOptions));
                $.cookie(this.config.ensembleUrl + '-pass', null, _.extend({}, cookieOptions));
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
