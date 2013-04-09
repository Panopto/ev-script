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
            this.appId = Math.random();
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

    q.test('test auth convenience methods', 3, function() {
        this.view.setAuth('foo', 'bar');
        q.ok(this.view.hasAuth());
        q.strictEqual(this.view.getUser(), 'foo');
        this.view.removeAuth();
        q.ok(!this.view.hasAuth());
    });

    q.test('test cache convenience methods', 4, function() {
        var user = 'foo',
            key = 'test',
            value = { foo: 'bar' };
        _.each([ 'Playlists', 'Videos', 'Orgs', 'Libs' ], function(element, index) {
            // Orgs signature is a little different
            if (element === 'Orgs') {
                this.view['setCached' + element].call(this, user, value);
                q.deepEqual(this.view['getCached' + element].call(this, user), value);
            } else {
                this.view['setCached' + element].call(this, user, key, value);
                q.deepEqual(this.view['getCached' + element].call(this, user, key), value);
            }
        }, this);
    });

    q.test('test has functions', 13, function() {
        q.ok(_.isFunction(this.view.ajaxError));
        q.ok(_.isFunction(this.view.getUser));
        q.ok(_.isFunction(this.view.setAuth));
        q.ok(_.isFunction(this.view.removeAuth));
        q.ok(_.isFunction(this.view.hasAuth));
        q.ok(_.isFunction(this.view.getCachedVideos));
        q.ok(_.isFunction(this.view.setCachedVideos));
        q.ok(_.isFunction(this.view.getCachedPlaylists));
        q.ok(_.isFunction(this.view.setCachedPlaylists));
        q.ok(_.isFunction(this.view.getCachedLibs));
        q.ok(_.isFunction(this.view.setCachedLibs));
        q.ok(_.isFunction(this.view.getCachedOrgs));
        q.ok(_.isFunction(this.view.setCachedOrgs));
    });

    // TODO - test ajaxError?
});
