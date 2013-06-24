define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events'),
        evSettings = require('ev-config'),
        BaseCollection = require('ev-script/collections/base'),
        Videos = require('ev-script/collections/videos'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        BasicAuth = require('ev-script/auth/basic/auth');

    q.module('Testing ev-script/collections/videos', {
        setup: function() {
            this.appId = 'ev-script/collections/videos';
            eventsUtil.initEvents(this.appId);
            this.config = _.extend({}, evSettings);
            cacheUtil.setAppConfig(this.appId, this.config);
            this.auth = (this.config.authType && this.config.authType === 'forms') ? new FormsAuth(this.appId) : new BasicAuth(this.appId);
            cacheUtil.setAppAuth(this.appId, this.auth);
            this.videos = new Videos([], {
                appId: this.appId
            });
            if (!this.auth.isAuthenticated()) {
                q.stop();
                this.auth.login({
                    username: evSettings.testUser,
                    password: evSettings.testPass
                })
                .then(function() {
                    q.start();
                });
            }
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
        q.ok(this.videos instanceof BaseCollection);
    });

    q.test('test initialize', 2, function() {
        // Make sure we've called BaseCollections initialize which sets
        // appId and config
        q.strictEqual(this.videos.appId, this.appId);
        q.deepEqual(this.videos.config, evSettings);
    });

    q.asyncTest('test fetch content', 1, function() {
        this.videos.sourceUrl = '/api/Content';
        this.videos.fetch({
            success: function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                collection.reset();
                q.start();
            },
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });

    q.asyncTest('test fetch shared content', 1, function() {
        this.videos.sourceUrl = '/api/SharedContent';
        this.videos.fetch({
            success: function(collection, response, options) {
                console.log(JSON.stringify(collection));
                q.ok(collection.size() > 0);
                collection.reset();
                q.start();
            },
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
