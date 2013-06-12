define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        evSettings = require('ev-config');

    q.module('Testing ev-script/util/auth', {
        setup: function() {
            this.appId = Math.random();
            cacheUtil.setAppConfig(this.appId, _.extend({}, evSettings));
        }
    });

    q.test('test getAuth', 1, function() {
        this.auth = authUtil.getAuth(this.appId);
        q.ok(this.auth instanceof BasicAuth, 'expected instance of BasicAuth');
    });

});
