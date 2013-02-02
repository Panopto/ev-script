define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        $ = require('jquery'),
        evSettings = require('ev-config'),
        auth = require('ev-script/util/auth'),
        globalEvents = require('ev-script/util/events').getEvents('global');

    q.module('Testing ev-script/util/auth');

    q.test('set/remove test', 4, function() {
        var authId = Math.random(),
            username = 'foo',
            password = 'bar';
        auth.setAuth(authId, '', '', username, password);
        q.ok(auth.hasAuth(authId));
        q.strictEqual(username, auth.getUser(authId));
        auth.removeAuth(authId);
        q.ok(!auth.hasAuth(authId));
        q.strictEqual(null, auth.getUser(authId));
    });

    q.test('domain test', 2, function() {
        var authId = Math.random(),
            username = 'foo',
            password = 'bar',
            authDomain = 'ensemblevideo.com';
        auth.setAuth(authId, authDomain, '', username, password);
        q.ok(auth.hasAuth(authId));
        q.strictEqual(username + '@' + authDomain, auth.getUser(authId));
    });

    q.test('valid path test', 1, function() {
        var authId = Math.random(),
            username = 'foo',
            password = 'bar';
        auth.setAuth(authId, '', '/test', username, password);
        q.ok(auth.hasAuth(authId));
    });

    q.test('invalid path test', 1, function() {
        var authId = Math.random(),
            username = 'foo',
            password = 'bar';
        auth.setAuth(authId, '', '/foo', username, password);
        q.ok(!auth.hasAuth(authId));
    });

    var pathTest = function(username, password, success, error) {
        var authId = Math.random();
        auth.setAuth(authId, '', evSettings.authPath, username, password);
        var apiUrl = encodeURIComponent(evSettings.ensembleUrl + '/api/Content');
        q.ok(auth.hasAuth(authId));
        q.stop();
        $.ajax({
            url: evSettings.proxyPath + '?authId=' + authId + '&request=' + apiUrl,
            success: success,
            error: error
        });
    };

    q.test('valid credentials test', 2, function() {
        var success = function(data, status, xhr) {
                q.start();
                q.ok(!_.isEmpty(data), 'Expected data to be set');
            },
            error = function(xhr, status, error) {
                q.start();
                q.ok(false, 'Expected success.  Recieved status ' + status);
            };
        pathTest('hasp', 'hasp', success, error);
    });

    q.test('invalid credentials test', 2, function() {
        var success = function(data, status, xhr) {
                q.start();
                q.ok(false, 'Expected failure.  Recieved data ' + JSON.stringify(data));
            },
            error = function(xhr, status, error) {
                q.start();
                q.equal(xhr.status, 401, 'Expected failure with 401 status.');
            };
        pathTest('foo', 'bar', success, error);
    });

});
