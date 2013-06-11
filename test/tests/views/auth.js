define(function(require) {

    'use strict';

    var q = QUnit,
        $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        eventsUtil = require('ev-script/util/events'),
        evSettings = require('ev-config'),
        AuthView = require('ev-script/views/auth');

    q.module('Testing ev-script/views/auth', {
        setup: function() {
            this.appId = Math.random();
            this.config = evSettings;
            cacheUtil.setAppConfig(this.appId, this.config);
            this.view = new AuthView({
                appId: this.appId
            });
        }
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

    q.test('test render', 8, function() {
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
        q.ok(!authUtil.isAuthenticated(config.ensembleUrl));
        $username.val(config.testUser);
        $password.val(config.testPass);
        q.stop();
        this.view.submitCallback = function() {
            q.ok(authUtil.isAuthenticated(config.ensembleUrl));
            q.strictEqual(authUtil.getUser(config.ensembleUrl), config.testUser);
            q.strictEqual($('.ev-auth').length, 0);
            q.start();
        };
        $form.submit();
    });

});
