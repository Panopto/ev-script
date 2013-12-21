define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        IdentityProviders = require('ev-script/collections/identity-providers');

    q.module('Testing ev-script/collections/identity-providers', {
        setup: testUtil.setupHelper('ev-script/collections/identity-providers', {
            postAuthCallback: function() {
                this.identityProviders = new IdentityProviders([], {
                    appId: this.appId
                });
            },
            authenticate: false
        })
    });

    q.test('test extends base', 1, function() {
        // Make sure we're extending BaseCollection
        q.ok(this.identityProviders instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.identityProviders.appId, this.appId);
        q.deepEqual(this.identityProviders.config, evSettings);
    });

    q.asyncTest('test fetch', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(2);
            var cacheKey = 'identityProviders';
            this.identityProviders.fetch({
                cacheKey: cacheKey,
                requiresAuth: false,
                success: _.bind(function(collection, response, options) {
                    console.log(JSON.stringify(collection));
                    q.ok(collection.size() > 0);
                    // Make sure caching is working
                    q.deepEqual(this.identityProviders.getCached(cacheKey), response);
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
