define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        evSettings = require('ev-config'),
        auth = require('ev-script/util/auth'),
        globalEvents = require('ev-script/util/events').getEvents('global');

    q.module('Testing ev-script/util/auth');

    q.test('check api', 5, function() {
        q.ok(_.isFunction(auth.getUser), 'expected getUser');
        q.ok(_.isFunction(auth.isAuthenticated), 'expected isAuthenticated');
        q.ok(_.isFunction(auth.login), 'expected login');
        q.ok(_.isFunction(auth.logout), 'expected logout');
        q.equal(_.size(auth), 4, 'is something exposed but not tested?');
    });

    q.test('set/remove test', 4, function() {
        var ensembleUrl = Math.random() + '',
            username = 'foo',
            password = 'bar';
        auth.login(ensembleUrl, '', '', username, password);
        q.ok(auth.isAuthenticated(ensembleUrl));
        q.strictEqual(username, auth.getUser(ensembleUrl));
        auth.logout(ensembleUrl, '');
        q.ok(!auth.isAuthenticated(ensembleUrl));
        q.strictEqual(null, auth.getUser(ensembleUrl));
    });

    q.asyncTest('loggedIn event test', 2, function() {
        var ensembleUrl = Math.random() + '',
            username = 'foo',
            password = 'bar';
        globalEvents.on('loggedIn', function(id) {
            if (id === ensembleUrl) {
                q.ok(true);
                q.start();
            }
        });
        auth.login(ensembleUrl, '', '', username, password);
        q.ok(auth.isAuthenticated(ensembleUrl));
        auth.logout(ensembleUrl, '');
    });

    q.asyncTest('loggedOut event test', 2, function() {
        var ensembleUrl = Math.random() + '',
            username = 'foo',
            password = 'bar';
        globalEvents.on('loggedOut', function(id) {
            if (id === ensembleUrl) {
                q.ok(true);
                q.start();
            }
        });
        auth.login(ensembleUrl, '', '', username, password);
        q.ok(auth.isAuthenticated(ensembleUrl));
        auth.logout(ensembleUrl, '');
    });

    q.test('domain test', 2, function() {
        var ensembleUrl = Math.random() + '',
            username = 'foo',
            password = 'bar',
            authDomain = 'ensemblevideo.com';
        auth.login(ensembleUrl, authDomain, '', username, password);
        q.ok(auth.isAuthenticated(ensembleUrl));
        q.strictEqual(username + '@' + authDomain, auth.getUser(ensembleUrl));
        auth.logout(ensembleUrl, '');
    });

    q.test('valid path test', 1, function() {
        var ensembleUrl = Math.random() + '',
            username = 'foo',
            password = 'bar',
            path = '/test';
        auth.login(ensembleUrl, '', path, username, password);
        q.ok(auth.isAuthenticated(ensembleUrl));
        auth.logout(ensembleUrl, path);
    });

    q.test('invalid path test', 1, function() {
        var ensembleUrl = Math.random() + '',
            username = 'foo',
            password = 'bar',
            path = '/foo';
        auth.login(ensembleUrl, '', path, username, password);
        q.ok(!auth.isAuthenticated(ensembleUrl));
        auth.logout(ensembleUrl, path);
    });

    var pathTest = function(username, password, successHandler, errorHandler) {
        var ensembleUrl = evSettings.ensembleUrl;
        auth.login(ensembleUrl, '', evSettings.authPath, username, password);
        var apiUrl = encodeURIComponent(ensembleUrl + '/api/Content');
        q.ok(auth.isAuthenticated(ensembleUrl));
        $.ajax({
            dataType: "json",
            url: evSettings.proxyPath + '?ensembleUrl=' + encodeURIComponent(ensembleUrl) + '&request=' + apiUrl,
            success: function(data, status, xhr) {
                successHandler.call(this, data, status, xhr);
                auth.logout(ensembleUrl, evSettings.authPath);
                q.start();
            },
            error: function(xhr, status, error) {
                errorHandler.call(this, xhr, status, error);
                auth.logout(ensembleUrl, evSettings.authPath);
                q.start();
            }
        });
    };

    q.asyncTest('valid credentials test', 2, function() {
        var success = function(data, status, xhr) {
                q.ok(!_.isEmpty(data), 'Expected data to be set');
            },
            error = function(xhr, status, error) {
                q.ok(false, 'Expected success.  Received status ' + status);
            };
        pathTest(evSettings.testUser, evSettings.testPass, success, error);
    });

    q.asyncTest('invalid credentials test', 2, function() {
        var success = function(data, status, xhr) {
                q.ok(false, 'Expected failure.  Received data ' + JSON.stringify(data));
            },
            error = function(xhr, status, error) {
                q.equal(xhr.status, 401, 'Expected failure with 401 status.');
            };
        pathTest('foo', 'bar', success, error);
    });

});
