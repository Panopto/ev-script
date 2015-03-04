define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        testUtil = require('test/util'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/auth/forms/auth', {
        setup: testUtil.setupHelper('ev-script/auth/forms/auth', {
            preAuthCallback: function() {
                // Only testing forms auth if supported
                if (this.info.get('ApplicationVersion')) {
                    // Regardless of configured auth...we're testing forms auth here
                    this.config.authType = 'forms';
                    delete(this.config.urlCallback);
                }
            },
            // Don't automatically authenticate as we're testing that here
            authenticate: false
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('is forms auth', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(1);
            // Sanity check to make sure our helper is initializing us correctly
            q.ok(this.auth instanceof FormsAuth);
        }
    });

    q.test('check api', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(5);
            q.ok(_.isFunction(this.auth.getUser), 'expected getUser');
            q.ok(_.isFunction(this.auth.isAuthenticated), 'expected isAuthenticated');
            q.ok(_.isFunction(this.auth.login), 'expected login');
            q.ok(_.isFunction(this.auth.logout), 'expected logout');
            q.ok(_.isFunction(this.auth.handleUnauthorized), 'expected handleUnauthorized');
        }
    });

    q.asyncTest('invalid credentials test', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(2);
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
                .always(function() {
                    q.start(1);
                });
            }, this))
            .always(function() {
                q.start(1);
            });
        } else {
            q.start();
        }
    });

    q.asyncTest('valid credentials test', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(4);
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
        } else {
            q.start();
        }
    });

    q.asyncTest('event test', 0, function() {
        if (this.info.get('ApplicationVersion')) {
            q.expect(2);
            // We're already running under one stop...add another as we expect two
            q.stop(1);
            var globalEvents = eventsUtil.getEvents('global');
            globalEvents.once('loggedIn', function(id) {
                if (id === evSettings.ensembleUrl) {
                    q.ok(true);
                    q.start(1);
                }
            });
            globalEvents.once('loggedOut', function(id) {
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
        } else {
            q.start();
        }
    });

});
