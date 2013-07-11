define(function(require) {

    'use strict';

    var q = QUnit,
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events'),
        _ = require('underscore'),
        evSettings = require('ev-config'),
        Backbone = require('backbone'),
        BaseView = require('ev-script/views/base');

    q.module('Testing ev-script/views/base', {
        setup: function() {
            this.appId = 'ev-script/views/base';
            this.config = evSettings;
            eventsUtil.initEvents(this.appId);
            cacheUtil.setAppConfig(this.appId, this.config);
            this.view = new BaseView({
                appId: this.appId
            });
        }
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
