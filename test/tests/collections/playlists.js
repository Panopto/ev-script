define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Playlists = require('ev-script/collections/playlists');

    q.module('Testing ev-script/collections/playlists', {
        setup: testUtil.setupHelper('ev-script/collections/playlists', {
            setupAuth: function() {
                this.playlists = new Playlists([], {
                    appId: this.appId
                });
            }
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.playlists instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.playlists.appId, this.appId);
        q.deepEqual(this.playlists.config, evSettings);
    });

    q.asyncTest('test fetch', 2, function() {
        var cacheKey = 'playlists';
        this.playlists.fetch({
            cacheKey: cacheKey,
            success: _.bind(function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                // Make sure caching is working
                q.deepEqual(this.playlists.getCached(cacheKey), response);
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
