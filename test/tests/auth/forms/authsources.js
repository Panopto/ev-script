define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        AuthSources = require('ev-script/auth/forms/authsources');

    q.module('Testing ev-script/auth/forms/authsources', {
        setup: function() {
            this.appId = 'ev-script/auth/forms/authsources';
            cacheUtil.setAppConfig(this.appId, evSettings);
            this.authSources = new AuthSources([], {
                appId: this.appId
            });
        }
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.authSources instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.authSources.appId, this.appId);
        q.deepEqual(this.authSources.config, evSettings);
    });

    q.asyncTest('test fetch', 1, function() {
        this.authSources.fetch({
            success: function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                q.start();
            },
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
