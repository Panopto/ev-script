define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Categories = require('ev-script/collections/categories'),
        Playlists = require('ev-script/collections/playlists');

    q.module('Testing ev-script/collections/categories', {
        setup: testUtil.setupHelper('ev-script/collections/categories', {
            postAuthCallback: function() {
                this.categories = new Categories([], {
                    appId: this.appId
                });
            }
        })
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.categories instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.categories.appId, this.appId);
        q.deepEqual(this.categories.config, evSettings);
    });

    q.asyncTest('test fetch', 1, function() {
        var playlists = new Playlists([], {
            appId: this.appId
        });
        playlists.fetch({
            success: _.bind(function(collection) {
                this.categories.playlistId = collection.at(0).id;
                this.categories.fetch({
                    success: _.bind(function(collection, response, options) {
                        console.log(JSON.stringify(collection));
                        q.ok(collection.size() > 0);
                        q.start();
                    }, this),
                    error: function(collection, response, options) {
                        q.ok(false, response.status);
                        q.start();
                    }
                });
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});