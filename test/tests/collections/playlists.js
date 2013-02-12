define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Playlists = require('ev-script/collections/playlists');

    q.module('Testing ev-script/collections/playlists', {
        setup: function() {
            this.appId = Math.random();
            cacheUtil.setAppConfig(this.appId, evSettings);
            authUtil.setAuth(evSettings.authId, null, evSettings.authPath, evSettings.testUser, evSettings.testPass);
            this.playlists = new Playlists([], {
                appId: this.appId
            });
        },
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

    q.asyncTest('test fetch', 1, function() {
        this.playlists.fetch({
            success: function(collection, response, options) {
                q.start();
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
            }
        });
    });
});
