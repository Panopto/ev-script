define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        CurrentUser = require('ev-script/auth/forms/current-user'),
        AuthView = require('ev-script/auth/forms/view'),
        FormsAuth = function(appId) {
            _.bindAll(this, 'getUserId', 'login', 'logout', 'isAuthenticated', 'handleUnauthorized');
            this.appId = appId;
            this.config = cacheUtil.getAppConfig(appId);
            this.globalEvents = eventsUtil.getEvents('global'),
            this.appEvents = eventsUtil.getEvents(appId);
            this.userId = null;
            this.appEvents.on('appLoaded', function() {
                this.fetchUserId();
            }, this);
        };

    _.extend(FormsAuth.prototype, {
        fetchUserId: function() {
            var currentUser = new CurrentUser({}, {
                appId: this.appId
            });
            return currentUser.fetch({
                success: _.bind(function(model, response, options) {
                    this.userId = model.id;
                    this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
                }, this),
                error: _.bind(function(model, response, options) {
                    this.userId = null;
                    this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                }, this)
            }).promise();
        },
        // Should return a unique identifier
        getUserId: function() {
            return this.userId;
        },
        login: function(loginInfo) {
            var url = this.config.ensembleUrl + '/api/Login';
            return $.ajax({
                url: this.config.urlCallback ? this.config.urlCallback(url) : url,
                type: 'POST',
                dataType: 'json',
                data: loginInfo,
                xhrFields: {
                    withCredentials: true
                },
                success: _.bind(function(data, status, xhr) {
                    var user = new CurrentUser(data.Data[0], {
                        appId: this.appId
                    });
                    this.userId = user.id;
                    this.globalEvents.trigger('loggedIn', this.config.ensembleUrl);
                }, this)
            }).promise();
        },
        logout: function() {
            var url = this.config.ensembleUrl + '/api/Logout';
            return $.ajax({
                url: this.config.urlCallback ? this.config.urlCallback(url) : url,
                type: 'POST',
                xhrFields: {
                    withCredentials: true
                },
                success: _.bind(function(data, status, xhr) {
                    this.userId = null;
                    this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
                }, this)
            }).promise();
        },
        isAuthenticated: function() {
            return this.getUserId() != null;
        },
        handleUnauthorized: function(element, authCallback) {
            this.userId = null;
            this.globalEvents.trigger('loggedOut', this.config.ensembleUrl);
            // TODO - update the following for forms auth
            // likely need to pass auth sources (make sure you check loadingSources deferred)
            var authView = new AuthView({
                el: element,
                submitCallback: authCallback,
                appId: this.appId,
                auth: this
            });
            authView.render();
        }
    });

    return FormsAuth;

});
