define(function(require) {

    'use strict';

    var q = QUnit,
        auth = require('ev-script/util/auth'),
        globalEvents = require('ev-script/util/events').getEvents('global'),
        authId = 'test',
        authDomain = '',
        authPath = '';

    q.module('Testing ev-script/util/auth');

    q.test('test', 2, function() {
        var username = 'foo',
            password = 'bar';
        auth.setAuth(authId, authDomain, authPath, username, password);
        q.ok(auth.hasAuth(authId));
        q.strictEqual(username, auth.getUser(authId));
    });

});
