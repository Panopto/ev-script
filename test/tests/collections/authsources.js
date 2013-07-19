define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        AuthSources = require('ev-script/collections/authsources');

    q.module('Testing ev-script/collections/authsources', {
        setup: function() {
            this.appId = 'ev-script/collections/authsources';
            cacheUtil.setAppConfig(this.appId, evSettings);
            this.authsources = new AuthSources([], {
                appId: this.appId
            });
        }
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.authsources instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.authsources.appId, this.appId);
        q.deepEqual(this.authsources.config, evSettings);
    });

    q.asyncTest('test fetch', 2, function() {
        var cacheKey = 'authsources';
        this.authsources.fetch({
            cacheKey: cacheKey,
            success: _.bind(function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                // Make sure caching is working
                q.deepEqual(this.authsources.getCached(cacheKey), response);
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
