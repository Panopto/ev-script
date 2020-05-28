define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events');

    var Cache = function() {
        this.cache = {};
        this.get = function(index) {
            return index ? this.cache[index] : null;
        };
        this.set = function(index, value) {
            return index ? this.cache[index] = value : null;
        };
        this.clear = function() {
            this.cache = {};
        };
        return this;
    };

    var caches = new Cache();

    var getCache = function(cacheName, skipInit) {
        var appCache;
        cacheName = cacheName || 'app';
        appCache = caches.get(cacheName);
        if (!appCache && !skipInit) {
            appCache = caches.set(cacheName, new Cache());
        }
        return appCache;
    };

    // Convenience method to initialize a cache for app-specific configuration
    var setConfig = function(config) {
        return getCache().set('config', config);
    };

    var getConfig = function() {
        return getCache().get('config');
    };

    // Convenience method to initialize a cache for upstream application info
    var setInfo = function(info) {
        return getCache().set('info', info);
    };

    var getInfo = function() {
        return getCache().get('info');
    };

    var setI18n = function(i18n) {
        return getCache().set('i18n', i18n);
    };

    var getI18n = function() {
        return getCache().get('i18n');
    };

    var setRoot = function(root) {
        return getCache().set('root', root);
    };

    var getRoot = function() {
        return getCache().get('root');
    };

    var setAuth = function(auth) {
        return getCache().set('auth', auth);
    };

    var getAuth = function() {
        return getCache().get('auth');
    };

    var events = eventsUtil.getEvents();
    events.on('loggedOut', function() {
        // Clear all caches except the default 'app' cache on logout
        var appCache = getCache(),
            root = getRoot();
        _.each(caches.cache, function(cache) {
            if (cache !== appCache) {
                cache.clear();
            }
        });
        root.clear();
        root.fetch({});
    });

    events.on('reload', function(target) {
        var caches = [];
        // TODO - handle other caches as appropriate
        // When we reload videos we also need to reload encodings
        if (target === 'videos') {
            caches.push(getCache('encodings', true));
        }
        caches.push(getCache(target, true));
        _.each(caches, function(cache) {
            if (cache) {
                cache.clear();
            }
        });
    });

    return {
        Cache: Cache,
        caches: caches,
        setConfig: setConfig,
        getConfig: getConfig,
        setInfo: setInfo,
        getInfo: getInfo,
        setI18n: setI18n,
        getI18n: getI18n,
        setRoot: setRoot,
        getRoot: getRoot,
        getAuth: getAuth,
        setAuth: setAuth,
        getCache: getCache
    };

});
