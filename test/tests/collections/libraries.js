define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Libraries = require('ev-script/collections/libraries');

    q.module('Testing ev-script/collections/libraries', {
        setup: testUtil.setupHelper('ev-script/collections/libraries', {
            postAuthCallback: function() {
                this.libs = new Libraries([], {
                    appId: this.appId
                });
            }
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.libs instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.libs.appId, this.appId);
        q.deepEqual(this.libs.config, evSettings);
    });

    q.asyncTest('test fetch', 2, function() {
        var cacheKey = 'libs';
        this.libs.fetch({
            cacheKey: cacheKey,
            success: _.bind(function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                // Make sure caching is working
                q.deepEqual(this.libs.getCached(cacheKey), response);
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
