define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Videos = require('ev-script/collections/videos');

    q.module('Testing ev-script/collections/videos', {
        setup: function() {
            this.appId = Math.random();
            cacheUtil.setAppConfig(this.appId, evSettings);
            authUtil.setAuth(evSettings.authId, null, evSettings.authPath, evSettings.testUser, evSettings.testPass);
            this.videos = new Videos([], {
                appId: this.appId
            });
        },
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

    q.asyncTest('test fetch content', 1, function() {
        this.videos.sourceUrl = '/api/Content';
        this.videos.fetch({
            success: function(collection, response, options) {
                q.start();
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                collection.reset();
            }
        });
    });

    q.asyncTest('test fetch shared content', 1, function() {
        this.videos.sourceUrl = '/api/SharedContent';
        this.videos.fetch({
            success: function(collection, response, options) {
                q.start();
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                collection.reset();
            }
        });
    });
});
