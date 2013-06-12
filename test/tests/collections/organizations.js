define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Organizations = require('ev-script/collections/organizations');

    q.module('Testing ev-script/collections/organizations', {
        setup: function() {
            this.appId = Math.random();
            cacheUtil.setAppConfig(this.appId, evSettings);
            this.auth = authUtil.getAuth(this.appId);
            this.auth.login({
                username: evSettings.testUser,
                password: evSettings.testPass
            });
            this.organizations = new Organizations([], {
                appId: this.appId
            });
        },
        teardown: function() {
            this.auth.logout();
        }
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.organizations instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.organizations.appId, this.appId);
        q.deepEqual(this.organizations.config, evSettings);
    });

    q.asyncTest('test fetch', 1, function() {
        this.organizations.fetch({
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
