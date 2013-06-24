define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    var Cache = function() {
        this.cache = [];
        this.get = function(index) {
            return index ? this.cache[index] : null;
        };
        this.set = function(index, value) {
            return index ? this.cache[index] = value : null;
        };
        return this;
    };

    var caches = new Cache();

    var _getAppCache = function(appId) {
        var appCache = caches.get(appId);
        if (!appCache) {
            appCache = caches.set(appId, new Cache());
        }
        return appCache;
    };

    // Convenience method to initialize a cache for app-specific configuration
    var setAppConfig = function(appId, config) {
        return _getAppCache(appId).set('config', config);
    };

    var getAppConfig = function(appId) {
        return _getAppCache(appId).get('config');
    };

    // Convenience method to initialize a cache for app-specific authentication
    var setAppAuth = function(appId, auth) {
        return _getAppCache(appId).set('auth', auth);
    };

    var getAppAuth = function(appId) {
        return _getAppCache(appId).get('auth');
    };

    var initUserCache = function() {
        var userCache = new Cache();
        userCache.set('videos', new Cache());
        userCache.set('playlists', new Cache());
        // There is only one value store for a users orgs
        userCache.set('orgs', null);
        userCache.set('libs', new Cache());
        return userCache;
    };

    var getUserCache = function(ensembleUrl, user) {
        var appCache = caches.get(ensembleUrl);
        if (!appCache) {
            appCache = caches.set(ensembleUrl, new Cache());
        }
        var userCache = appCache.get(user);
        if (!userCache) {
            userCache = appCache.set(user, initUserCache());
        }
        return userCache;
    };

    return {
        Cache: Cache,
        caches: caches,
        setAppConfig: setAppConfig,
        getAppConfig: getAppConfig,
        setAppAuth: setAppAuth,
        getAppAuth: getAppAuth,
        getUserCache: getUserCache
    };

});
