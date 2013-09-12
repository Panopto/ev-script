define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        CurrentUser = require('ev-script/models/current-user'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        AppInfo = require('ev-script/models/app-info');

    q.module('Testing ev-script/models/current-user', {
        setup: function() {
            q.stop();
            this.appId = 'ev-script/models/current-user';
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
                this.currentUser = new CurrentUser({}, {
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

    q.test('test extends Backbone.Model', 1, function() {
        q.ok(this.currentUser instanceof Backbone.Model);
    });

    q.test('test initialize', 2, function() {
        q.strictEqual(this.currentUser.appId, this.appId);
        q.deepEqual(this.currentUser.config, evSettings);
    });

    q.asyncTest('test fetch', 1, function() {
        this.currentUser.fetch({
            success: _.bind(function(model, response) {
                console.log(JSON.stringify(model));
                q.strictEqual(this.currentUser.id, response.Data[0].ID);
                q.start();
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
