define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        testUtil = require('test/util'),
        eventsUtil = require('ev-script/util/events'),
        BaseView = require('ev-script/views/base');

    q.module('Testing ev-script/views/base', {
        setup: testUtil.setupHelper('ev-script/views/base', {
            setupAuth: function() {
                this.view = new BaseView({
                    appId: this.appId
                });
            },
            authenticate: false
        })
    });

    q.test('test extends Backbone.View', 1, function() {
        q.ok(this.view instanceof Backbone.View);
    });

    q.test('test initialize', 6, function() {
        // Make sure view has appId and config
        q.strictEqual(this.view.appId, this.appId);
        // Make sure we're grabbing the appropriate app config
        q.deepEqual(this.view.config, this.config);
        // Check view has necessary events objects
        q.ok(!_.isEmpty(eventsUtil.getEvents()));
        q.deepEqual(this.view.globalEvents, eventsUtil.getEvents());
        q.ok(!_.isEmpty(eventsUtil.getEvents(this.appId)));
        q.deepEqual(this.view.appEvents, eventsUtil.getEvents(this.appId));
    });

    // TODO - test ajaxError?
});
