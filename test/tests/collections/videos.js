define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Videos = require('ev-script/collections/videos');

    q.module('Testing ev-script/collections/videos', {
        setup: testUtil.setupHelper('ev-script/collections/videos', {
            setupAuth: function() {
                this.videos = new Videos([], {
                    appId: this.appId
                });
            }
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.videos instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.videos.appId, this.appId);
        q.deepEqual(this.videos.config, evSettings);
    });

    q.asyncTest('test fetch content', 2, function() {
        var cacheKey = 'content';
        this.videos.sourceUrl = '/api/Content';
        this.videos.fetch({
            cacheKey: cacheKey,
            success: _.bind(function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                // Make sure caching is working
                q.deepEqual(this.videos.getCached(cacheKey), response);
                this.videos.setCached(cacheKey, null);
                collection.reset();
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });

    q.asyncTest('test fetch shared content', 2, function() {
        var cacheKey = 'shared';
        this.videos.sourceUrl = '/api/SharedContent';
        this.videos.fetch({
            cacheKey: cacheKey,
            success: _.bind(function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                // Make sure caching is working
                q.deepEqual(this.videos.getCached(cacheKey), response);
                collection.reset();
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
