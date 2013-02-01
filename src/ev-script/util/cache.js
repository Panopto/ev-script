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

    var appCache = new Cache();

    var initAppCache = function(ensembleUrl) {
        return appCache.set(ensembleUrl, new Cache());
    };

    var initUserCache = function(ensembleUrl, user) {
        var userCache = new Cache();
        userCache.set('videos', new Cache());
        userCache.set('playlists', new Cache());
        // There is only one value store for a users orgs
        userCache.set('orgs', null);
        userCache.set('libs', new Cache());
        return appCache.get(ensembleUrl).set(user, userCache);
    };

    var getUserCache = function(ensembleUrl, user) {
        var userCache = appCache.get(ensembleUrl).get(user);
        if (!userCache) {
            userCache = initUserCache(ensembleUrl, user);
        }
        return userCache;
    };

    return {
        Cache: Cache,
        initAppCache: initAppCache,
        initUserCache: initUserCache,
        getUserCache: getUserCache
    };

});
