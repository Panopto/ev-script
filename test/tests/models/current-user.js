define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        CurrentUser = require('ev-script/models/current-user');

    q.module('Testing ev-script/models/current-user', {
        setup: testUtil.setupHelper('ev-script/models/current-user', {
            postAuthCallback: function() {
                this.currentUser = new CurrentUser({}, {
                    appId: this.appId
                });
            }
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('test extends Backbone.Model', 1, function() {
        q.ok(this.currentUser instanceof Backbone.Model);
    });

    q.test('test initialize', 2, function() {
        q.strictEqual(this.currentUser.appId, this.appId);
        q.deepEqual(this.currentUser.config, evSettings);
    });

    q.asyncTest('test fetch', 0, function() {
        // Don't try to fetch if this isn't support by the API
        if (this.info.get('ApplicationVersion')) {
            q.expect(1);
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
        } else {
            q.start();
        }
    });
});
