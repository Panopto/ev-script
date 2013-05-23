define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        MediaWorkflows = require('ev-script/collections/media-workflows');

    q.module('Testing ev-script/collections/media-workflows', {
        setup: function() {
            this.appId = Math.random();
            cacheUtil.setAppConfig(this.appId, evSettings);
            authUtil.setAuth(evSettings.authId, null, evSettings.authPath, evSettings.testUser, evSettings.testPass);
            this.workflows = new MediaWorkflows([], {
                appId: this.appId
            });
        }
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.workflows instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.workflows.appId, this.appId);
        q.deepEqual(this.workflows.config, evSettings);
    });

    q.test('test parse', 2, function() {
        var data = this.workflows.parse({
            Data: 'foo',
            Settings: 'bar'
        });
        q.strictEqual(data, 'foo', 'expected parse to return Data value');
        q.strictEqual(this.workflows.settings, 'bar', 'expected parse to retrieve settings');
    });

    q.asyncTest('test fetch', 1, function() {
        this.workflows.fetch({
            success: function(collection, response, options) {
                q.start();
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
            }
        });
    });
});
