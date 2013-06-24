define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events');

    q.module('Testing ev-script/util/events', {
        setup: function() {
            var appId = 'ev-script/util/events';
            this.globalEvents = eventsUtil.getEvents('global');
            this.appEvents = eventsUtil.initEvents(appId);
        },
        teardown: function() {
            this.globalEvents.off();
            this.appEvents.off();
        }
    });

    q.test('test api', 5, function() {
        q.ok(_.isFunction(eventsUtil.initEvents));
        q.ok(_.isFunction(eventsUtil.getEvents));
        q.equal(_.size(eventsUtil), 2);
        q.ok(_.isObject(eventsUtil.getEvents()), 'expect a global events object to be available');
        q.ok(!eventsUtil.getEvents('foo'), 'non-global events object needs to be initialized first');
    });

    q.test('test is Backbone.Events', 2, function() {
        q.deepEqual(eventsUtil.getEvents(), Backbone.Events);
        q.deepEqual(eventsUtil.initEvents(''), Backbone.Events);
    });

    q.asyncTest('global events test', 1, function() {
        this.globalEvents.on('foo', function() {
            q.start();
            q.ok(true, 'expected global event to be handled');
        });
        this.appEvents.on('foo', function() {
            q.start();
            q.ok(false, 'app event should not have been handled');
        });
        this.globalEvents.trigger('foo');
    });

    q.asyncTest('non-global events test', 1, function() {
        this.appEvents.on('foo', function() {
            q.start();
            q.ok(true, 'expected app event to be handled');
        });
        this.globalEvents.on('foo', function() {
            q.start();
            q.ok(false, 'global event should not have been handled');
        });
        this.appEvents.trigger('foo');
    });

});
