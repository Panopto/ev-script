define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        CurrentUser = require('ev-script/models/current-user'),
        BaseAuth = function() {
            _.bindAll(this, 'getUser', /*'login', 'logout',*/ 'isAuthenticated', 'handleUnauthorized', 'authCallback');
            this.config = cacheUtil.getConfig();
            this.root = cacheUtil.getRoot();
            this.info = cacheUtil.getInfo();
            this.globalEvents = eventsUtil.getEvents('global');
            this.appEvents = eventsUtil.getEvents();
            this.user = null;
            this.appEvents.on('appLoaded', this.initCallback, this);
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
        initCallback: function() {
            var user = this.root.getEmbedded('ev:Users/Current');
            if (!user) {
                this.user = null;
                this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                return;
            }
            this.user = user;
            // new CurrentUser(user, {});
            this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
        },
        authCallback: function() {}
    });

    return BaseAuth;

});
