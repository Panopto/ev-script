define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Organizations = require('ev-script/collections/organizations'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        AppInfo = require('ev-script/models/app-info');

    q.module('Testing ev-script/collections/organizations', {
        setup: function() {
            q.stop();
            this.appId = 'ev-script/collections/organizations';
            eventsUtil.initEvents(this.appId);
            this.config = _.extend({}, evSettings);
            cacheUtil.setAppConfig(this.appId, this.config);
            var info = new AppInfo({}, {
                appId: this.appId
            });
            cacheUtil.setAppInfo(this.appId, info);
            info.fetch({})
            .always(_.bind(function() {
                this.auth = (this.config.authType && this.config.authType === 'forms') ? new FormsAuth(this.appId) : new BasicAuth(this.appId);
                cacheUtil.setAppAuth(this.appId, this.auth);
                this.organizations = new Organizations([], {
                    appId: this.appId
                });
                if (!this.auth.isAuthenticated()) {
                    this.auth.login({
                        username: evSettings.testUser,
                        password: evSettings.testPass
                    })
                    .then(function() {
                        q.start();
                    });
                }
            }, this));
        },
        teardown: function() {
            if (this.auth.isAuthenticated()) {
                q.stop();
                this.auth.logout()
                .always(function() {
                    q.start();
                });
            }
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

    q.asyncTest('test fetch', 2, function() {
        var cacheKey = 'orgs';
        this.organizations.fetch({
            cacheKey: cacheKey,
            success: _.bind(function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                // Make sure caching is working
                q.deepEqual(this.organizations.getCached(cacheKey), response);
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
