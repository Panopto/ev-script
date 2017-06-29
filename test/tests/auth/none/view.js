define(function(require) {

    'use strict';

    var q = QUnit,
        $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        testUtil = require('test/util'),
        cacheUtil = require('ev-script/util/cache'),
        NoneAuth = require('ev-script/auth/none/auth'),
        eventsUtil = require('ev-script/util/events'),
        evSettings = require('ev-config'),
        AuthView = require('ev-script/auth/none/view');

    q.module('Testing ev-script/auth/none/view', {
        setup: testUtil.setupHelper('ev-script/auth/none/view', {
            configCallback: function() {
                this.config.authType = 'none';
            },
            postAuthCallback: function() {
                this.view = new AuthView({
                    auth: this.auth,
                    appId: this.appId
                });
            },
            authenticate: false
        }),
        teardown: testUtil.teardownHelper()
    });

    // Note that AuthView can't extend our Base as that would (currently)
    // introduce a circular dependency :/
    q.test('test extends Backbone.View', 1, function() {
        q.ok(this.view instanceof Backbone.View);
    });

    q.test('test initialize', 3, function() {
        q.strictEqual(this.view.appId, this.appId);
        q.deepEqual(this.view.config, this.config);
        q.deepEqual(this.view.appEvents, eventsUtil.getEvents(this.appId));
    });

    q.test('test render', 2, function() {
        this.view.render();
        // Make sure the DOM contains our class
        var $auth = $('.ev-auth');
        q.ok($auth.length > 0);
        q.ok(this.view.$dialog && this.view.$dialog.length > 0);
        this.view.$dialog.dialog('destroy').remove();
    });

});
