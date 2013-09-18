define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        AuthSources = require('ev-script/collections/authsources');

    q.module('Testing ev-script/collections/authsources', {
        setup: testUtil.setupHelper('ev-script/collections/authsources', {
            postAuthCallback: function() {
                this.authsources = new AuthSources([], {
                    appId: this.appId
                });
            },
            authenticate: false
        })
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

    q.asyncTest('test fetch', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(2);
            var cacheKey = 'authsources';
            this.authsources.fetch({
                cacheKey: cacheKey,
                requiresAuth: false,
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
        } else {
            q.start();
        }
    });
});
