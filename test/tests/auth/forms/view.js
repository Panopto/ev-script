define(function(require) {

    'use strict';

    var q = QUnit,
        $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        testUtil = require('test/util'),
        cacheUtil = require('ev-script/util/cache'),
        BasicAuth = require('ev-script/auth/forms/auth'),
        eventsUtil = require('ev-script/util/events'),
        evSettings = require('ev-config'),
        AuthView = require('ev-script/auth/forms/view');

    q.module('Testing ev-script/auth/forms/view', {
        setup: testUtil.setupHelper('ev-script/auth/forms/view', {
            configCallback: function() {
                this.config.authType = 'forms';
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

    q.test('test initialize', 4, function() {
        q.strictEqual(this.view.appId, this.appId);
        q.deepEqual(this.view.config, this.config);
        q.deepEqual(this.view.appEvents, eventsUtil.getEvents(this.appId));
        q.ok(_.isFunction(this.view.submitCallback));
    });

    q.asyncTest('test render', 8, function() {
        this.view.render();
        var config = this.view.config;
        // Make sure the DOM contains our class
        var $auth = $('.ev-auth');
        q.ok($auth.length > 0);
        // Make sure the element contains a form
        var $form = $('form', $auth);
        q.ok($form.length > 0);
        // Make sure the form contains username/password fields
        var $username = $('#username', $form);
        var $password = $('#password', $form);
        q.ok($username.length > 0);
        q.ok($password.length > 0);
        // Make sure form works as expected
        q.ok(!this.auth.isAuthenticated());
        $username.val(config.testUser);
        $password.val(config.testPass);
        this.view.submitCallback = function() {
            q.ok(this.auth.isAuthenticated());
            q.strictEqual(this.auth.getUser(), config.testUser);
            q.strictEqual($('.ev-auth').length, 0);
            q.start();
        };
        $form.submit();
    });

});
