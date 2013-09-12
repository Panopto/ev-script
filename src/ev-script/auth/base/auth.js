define(function(require) {

    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        CurrentUser = require('ev-script/models/current-user'),
        BaseAuth = function(appId) {
            _.bindAll(this, 'getUser', 'login', 'logout', 'isAuthenticated', 'handleUnauthorized');
            this.appId = appId;
            this.config = cacheUtil.getAppConfig(appId);
            this.info = cacheUtil.getAppInfo(appId);
            this.globalEvents = eventsUtil.getEvents('global');
            this.appEvents = eventsUtil.getEvents(appId);
            this.user = null;
            this.appEvents.on('appLoaded', function() {
                this.fetchUser();
            }, this);
        };

    // Reusing Backbone's object model for extension
    BaseAuth.extend = Backbone.Model.extend;

    _.extend(BaseAuth.prototype, {
        fetchUser: function() {
            var currentUser = new CurrentUser({}, {
                appId: this.appId
            });
            return currentUser.fetch({
                success: _.bind(function(model, response, options) {
                    this.user = model;
                    this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
                }, this),
                error: _.bind(function(model, response, options) {
                    this.user = null;
                    this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                }, this)
            }).promise();
        },
        getUser: function() {
            return this.user;
        },
        login: function(loginInfo) {},
        logout: function() {},
        isAuthenticated: function() {
            return this.user != null;
        },
        handleUnauthorized: function(element, authCallback) {}
    });

    return BaseAuth;

});
