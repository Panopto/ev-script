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

    // Convenience method to initialize a cache for upstream application info
    var setAppInfo = function(appId, info) {
        return _getAppCache(appId).set('info', info);
    };

    var getAppInfo = function(appId) {
        return _getAppCache(appId).get('info');
    };

    var setAppI18n = function(appId, i18n) {
        return _getAppCache(appId).set('i18n', i18n);
    };

    var getAppI18n = function(appId) {
        return _getAppCache(appId).get('i18n');
    };

    var getUserCache = function(ensembleUrl, user) {
        var appCache = caches.get(ensembleUrl);
        if (!appCache) {
            appCache = caches.set(ensembleUrl, new Cache());
        }
        var userCache = appCache.get(user);
        if (!userCache) {
            userCache = appCache.set(user, new Cache());
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
        setAppInfo: setAppInfo,
        getAppInfo: getAppInfo,
        setAppI18n: setAppI18n,
        getAppI18n: getAppI18n,
        getUserCache: getUserCache
    };

});
