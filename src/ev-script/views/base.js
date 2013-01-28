/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        root = this,
        configUtil = require('ev-script/util/config'),
        authUtil = require('ev-script/util/auth'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        AuthView = require('ev-script/views/auth');

    var getCachedValue = function(ensembleUrl, user, cache, key) {
        return cacheUtil.getUserCache(ensembleUrl, user).get(cache).get(key);
    };

    var setCachedValue = function(ensembleUrl, user, cache, key, value) {
        return cacheUtil.getUserCache(ensembleUrl, user).get(cache).set(key, value);
    };

    return Backbone.View.extend({
        initialize: function(options) {
            this.appId = options.appId;
            this.config = configUtil.getConfig(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.globalEvents = eventsUtil.getEvents('global');
        },
        ajaxError: function(xhr, authCallback) {
            if (xhr.status === 401) {
                this.removeAuth();
                var authView = new AuthView({
                    el: this.el,
                    submitCallback: authCallback,
                    appId: this.appId
                });
            } else if (xhr.status === 500) {
                // Making an assumption that root is window here...
                root.alert('It appears there is an issue with the Ensemble Video installation.');
            } else if (xhr.status === 404) {
                root.alert('Could not find requested resource.  This is likely a problem with the configured Ensemble Video base url.');
            } else {
                root.alert('An unexpected error occurred.  Check the server log for more details.');
            }
        },
        getUser: function() {
            return authUtil.getUser(this.config.authId);
        },
        setAuth: function(username, password) {
            authUtil.setAuth(this.config.authId, this.config.authDomain, this.config.authPath, username, password);
        },
        removeAuth: function() {
            authUtil.removeAuth(this.config.authId, this.config.authPath);
        },
        hasAuth: function() {
            return authUtil.hasAuth(this.config.authId);
        },
        getCachedVideos: function(user, key) {
            return getCachedValue(this.config.ensembleUrl, user, 'videos', key);
        },
        setCachedVideos: function(user, key, value) {
            return setCachedValue(this.config.ensembleUrl, user, 'videos', key, value);
        },
        getCachedPlaylists: function(user, key) {
            return getCachedValue(this.config.ensembleUrl, user, 'playlists', key);
        },
        setCachedPlaylists: function(user, key, value) {
            return setCachedValue(this.config.ensembleUrl, user, 'playlists', key, value);
        },
        getCachedLibs: function(user, key) {
            return getCachedValue(this.config.ensembleUrl, user, 'libs', key);
        },
        setCachedLibs: function(user, key, value) {
            return setCachedValue(this.config.ensembleUrl, user, 'libs', key, value);
        },
        getCachedOrgs: function(user) {
            return cacheUtil.getUserCache(this.config.ensembleUrl, user).get('orgs');
        },
        setCachedOrgs: function(user, value) {
            return cacheUtil.getUserCache(this.config.ensembleUrl, user).set('orgs', value);
        }
    });

});
