define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        CurrentUser = require('ev-script/models/current-user'),
        BaseAuth = function(appId) {
            _.bindAll(this, 'getUser', /*'login', 'logout',*/ 'isAuthenticated', 'handleUnauthorized', 'authCallback');
            this.appId = appId;
            this.config = cacheUtil.getAppConfig(appId);
            this.root = cacheUtil.getAppRoot(appId);
            this.info = cacheUtil.getAppInfo(appId);
            this.globalEvents = eventsUtil.getEvents('global');
            this.appEvents = eventsUtil.getEvents(appId);
            this.user = null;
            this.appEvents.on('appLoaded', this.authCallback, this);
        };

    // Reusing Backbone's object model for extension
    BaseAuth.extend = Backbone.Model.extend;

    _.extend(BaseAuth.prototype, {
        getUser: function() {
            return this.user;
        },
        // // Return failed promise...subclasses should override
        // login: function(loginInfo) {
        //     return $.Deferred().reject().promise();
        // },
        // // Return failed promise...subclasses should override
        // logout: function() {
        //     return $.Deferred().reject().promise();
        // },
        isAuthenticated: function() {
            return this.user;
        },
        handleUnauthorized: function(element, authCallback) {},
        authCallback: function() {
            if (!this.root.embedded.user) {
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                return;
            }
            this.user = new CurrentUser(this.root.embedded.user, {
                appId: this.appId
            });
            this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
        }
    });

    return BaseAuth;

});
