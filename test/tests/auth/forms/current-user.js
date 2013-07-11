define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache'),
        CurrentUser = require('ev-script/auth/forms/current-user'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        BasicAuth = require('ev-script/auth/basic/auth');

    q.module('Testing ev-script/auth/forms/current-user', {
        setup: function() {
            this.appId = 'ev-script/auth/forms/current-user';
            eventsUtil.initEvents(this.appId);
            this.config = _.extend({}, evSettings);
            cacheUtil.setAppConfig(this.appId, this.config);
            this.auth = (this.config.authType && this.config.authType === 'forms') ? new FormsAuth(this.appId) : new BasicAuth(this.appId);
            cacheUtil.setAppAuth(this.appId, this.auth);
            this.currentUser = new CurrentUser({}, {
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
