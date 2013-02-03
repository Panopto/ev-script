define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/util/events');

    q.test('test api', 5, function() {
        q.ok(_.isFunction(eventsUtil.initEvents));
        q.ok(_.isFunction(eventsUtil.getEvents));
        q.equal(_.size(eventsUtil), 2);
        q.ok(_.isObject(eventsUtil.getEvents()), 'expect a global events object to be available');
        q.ok(!eventsUtil.getEvents('foo'), 'non-global events object needs to be initialized first');
    });

    q.asyncTest('global events test', 1, function() {
        var appId = Math.random();
        var globalEvents = eventsUtil.getEvents('global');
        var appEvents = eventsUtil.initEvents(appId);
        globalEvents.on('foo', function() {
            q.start();
            q.ok(true, 'expected global event to be handled');
        });
        appEvents.on('foo', function() {
            q.start();
            q.ok(false, 'app event should not have been handled');
        });
        globalEvents.trigger('foo');
    });

    q.asyncTest('non-global events test', 1, function() {
        var appId = Math.random();
        var globalEvents = eventsUtil.getEvents('global');
        var appEvents = eventsUtil.initEvents(appId);
        appEvents.on('foo', function() {
            q.start();
            q.ok(true, 'expected app event to be handled');
        });
        globalEvents.on('foo', function() {
            q.start();
            q.ok(false, 'global event should not have been handled');
        });
        appEvents.trigger('foo');
    });

});
