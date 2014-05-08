define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        testUtil = require('test/util'),
        NoneAuth = require('ev-script/auth/none/auth'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/auth/none/auth', {
        setup: testUtil.setupHelper('ev-script/auth/none/auth', {
            preAuthCallback: function() {
                    this.config.authType = 'none';
            },
            // Don't automatically authenticate as we're testing that here
            authenticate: false
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('is none auth', 0, function() {
        q.expect(1);
        // Sanity check to make sure our helper is initializing us correctly
        q.ok(this.auth instanceof NoneAuth);
    });

    q.test('check api', 0, function() {
        q.expect(5);
        q.ok(_.isFunction(this.auth.getUser), 'expected getUser');
        q.ok(_.isFunction(this.auth.isAuthenticated), 'expected isAuthenticated');
        q.ok(_.isFunction(this.auth.login), 'expected login');
        q.ok(_.isFunction(this.auth.logout), 'expected logout');
        q.ok(_.isFunction(this.auth.handleUnauthorized), 'expected handleUnauthorized');
    });

    q.asyncTest('valid login should fail (login does nothing)', 0, function() {
        q.expect(3);
        q.stop(1);
        this.auth.login({
            username: evSettings.testUser,
            password: evSettings.testPass
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

});
