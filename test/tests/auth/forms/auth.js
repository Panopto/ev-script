define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        cacheUtil = require('ev-script/util/cache'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/auth/forms/auth', {
        setup: function() {
            var appId = 'ev-script/auth/forms/auth';
            eventsUtil.initEvents(appId);
            this.config = _.extend({}, evSettings);
            this.config.authType = 'forms';
            delete(this.config.urlCallback);
            cacheUtil.setAppConfig(appId, this.config);
            this.auth = new FormsAuth(appId);
            cacheUtil.setAppAuth(appId, this.auth);
            this.globalEvents = eventsUtil.getEvents('global');
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

    q.test('check api', 5, function() {
        q.ok(_.isFunction(this.auth.getUser), 'expected getUser');
        q.ok(_.isFunction(this.auth.isAuthenticated), 'expected isAuthenticated');
        q.ok(_.isFunction(this.auth.login), 'expected login');
        q.ok(_.isFunction(this.auth.logout), 'expected logout');
        q.ok(_.isFunction(this.auth.handleUnauthorized), 'expected handleUnauthorized');
    });

    q.asyncTest('invalid credentials test', 3, function() {
        q.stop(1);
        var username = 'foo',
            password = 'bar';
        this.auth.login({
            username: username,
            password: password
        })
        .fail(_.bind(function() {
            q.ok(!this.auth.isAuthenticated());
            q.strictEqual(this.auth.getUser(), null);
            this.auth.logout()
            .fail(function() {
                q.ok(true);
            })
            .always(function() {
                q.start(1);
            });
        }, this))
        .always(function() {
            q.start(1);
        });
    });

    q.asyncTest('valid credentials test', 4, function() {
        q.stop(1);
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        })
        .done(_.bind(function() {
            q.ok(this.auth.isAuthenticated());
            q.ok(this.auth.getUser() !== null);
            this.auth.logout()
            .done(_.bind(function() {
                q.ok(!this.auth.isAuthenticated());
                q.strictEqual(this.auth.getUser(), null);
            }, this))
            .always(function() {
                q.start(1);
            });
        }, this))
        .always(function() {
            q.start(1);
        });
    });

    q.asyncTest('event test', 2, function() {
        // We're already running under one stop...add another as we expect two
        q.stop(1);
        this.globalEvents.once('loggedIn', function(id) {
            if (id === evSettings.ensembleUrl) {
                q.ok(true);
                q.start(1);
            }
        });
        this.globalEvents.once('loggedOut', function(id) {
            if (id === evSettings.ensembleUrl) {
                q.ok(true);
                q.start(1);
            }
        });
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
        })
        .done(_.bind(function() {
            this.auth.logout();
        }, this));
    });

});
