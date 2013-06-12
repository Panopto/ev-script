define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        cacheUtil = require('ev-script/util/cache'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        evSettings = require('ev-config'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/auth/basic/auth', {
        setup: function() {
            var appId = Math.random();
            cacheUtil.setAppConfig(appId, _.extend({}, evSettings));
            this.auth = new BasicAuth(appId);
            this.globalEvents = eventsUtil.getEvents('global');
        },
        teardown: function() {
            this.auth.logout();
        }
    });

    q.test('check api', 5, function() {
        q.ok(_.isFunction(this.auth.getUser), 'expected getUser');
        q.ok(_.isFunction(this.auth.isAuthenticated), 'expected isAuthenticated');
        q.ok(_.isFunction(this.auth.login), 'expected login');
        q.ok(_.isFunction(this.auth.logout), 'expected logout');
        q.ok(_.isFunction(this.auth.handleUnauthorized), 'expected handleUnauthorized');
    });

    q.test('login/logout test', 4, function() {
        var username = 'foo',
            password = 'bar';
        this.auth.login({
            username: username,
            password: password
        });
        q.ok(this.auth.isAuthenticated());
        q.strictEqual(username, this.auth.getUser());
        this.auth.logout();
        q.ok(!this.auth.isAuthenticated());
        q.strictEqual(null, this.auth.getUser());
    });

    q.asyncTest('loggedIn event test', 2, function() {
        var username = 'foo',
            password = 'bar';
        this.globalEvents.once('loggedIn', function(id) {
            if (id === evSettings.ensembleUrl) {
                q.ok(true);
                q.start();
            }
        });
        this.auth.login({
            username: username,
            password: password
        });
        q.ok(this.auth.isAuthenticated());
    });

    q.asyncTest('loggedOut event test', 2, function() {
        var username = 'foo',
            password = 'bar';
        this.globalEvents.once('loggedOut', function(id) {
            if (id === evSettings.ensembleUrl) {
                q.ok(true);
                q.start();
            }
        });
        this.auth.login({
            username: username,
            password: password
        });
        q.ok(this.auth.isAuthenticated());
        this.auth.logout();
    });

    q.test('domain test', 2, function() {
        var username = 'foo',
            password = 'bar';
        this.auth.config.authDomain = 'ensemblevideo.com';
        this.auth.login({
            username: username,
            password: password
        });
        q.ok(this.auth.isAuthenticated());
        q.strictEqual(username + '@' + this.auth.config.authDomain, this.auth.getUser());
    });

    q.test('valid path test', 1, function() {
        var username = 'foo',
            password = 'bar';
        this.auth.config.authPath = '/test';
        this.auth.login({
            username: username,
            password: password
        });
        q.ok(this.auth.isAuthenticated());
    });

    q.test('invalid path test', 1, function() {
        var username = 'foo',
            password = 'bar';
        this.auth.config.authPath = '/foo';
        this.auth.login({
            username: username,
            password: password
        });
        q.ok(!this.auth.isAuthenticated());
    });

    var pathTest = function(auth, username, password, successHandler, errorHandler) {
        auth.login({
            username: username,
            password: password
        });
        var apiUrl = encodeURIComponent(evSettings.ensembleUrl + '/api/Content');
        q.ok(auth.isAuthenticated());
        $.ajax({
            dataType: "json",
            url: evSettings.proxyPath + '?ensembleUrl=' + encodeURIComponent(evSettings.ensembleUrl) + '&request=' + apiUrl,
            success: function(data, status, xhr) {
                successHandler.call(this, data, status, xhr);
            },
            error: function(xhr, status, error) {
                errorHandler.call(this, xhr, status, error);
            }
        });
    };

    q.asyncTest('valid credentials test', 2, function() {
        var success = function(data, status, xhr) {
                q.ok(!_.isEmpty(data), 'Expected data to be set');
                q.start();
            },
            error = function(xhr, status, error) {
                q.ok(false, 'Expected success.  Received status ' + status);
                q.start();
            };
        pathTest(this.auth, evSettings.testUser, evSettings.testPass, success, error);
    });

    q.asyncTest('invalid credentials test', 2, function() {
        var success = function(data, status, xhr) {
                q.ok(false, 'Expected failure.  Received data ' + JSON.stringify(data));
                q.start();
            },
            error = function(xhr, status, error) {
                q.equal(xhr.status, 401, 'Expected failure with 401 status.');
                q.start();
            };
        pathTest(this.auth, 'foo', 'bar', success, error);
    });

});
