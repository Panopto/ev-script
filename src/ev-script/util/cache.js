define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone');

    var Cache = function() {
        var cache = [];
        return {
            cache: cache,
            get: function(index) {
                return cache[index];
            },
            set: function(index, value) {
                return cache[index] = value;
            }
        };
    };

    var caches = new Cache();

    // Convenience method to initialize a cache for app-specific configuration
    var setAppConfig = function(appId, config) {
        return caches.set(appId, new Cache()).set('config', config);
    };

    var getAppConfig = function(appId) {
        return caches.get(appId).get('config');
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
        getUserCache: getUserCache
    };

});
