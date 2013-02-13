define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        evSettings = require('ev-config'),
        cacheUtil = require('ev-script/util/cache'),
        authUtil = require('ev-script/util/auth'),
        Videos = require('ev-script/collections/videos'),
        VideoEncoding = require('ev-script/models/video-encoding');

    q.module('Testing ev-script/models/video-encoding', {
        setup: function() {
            this.appId = Math.random();
            cacheUtil.setAppConfig(this.appId, evSettings);
            authUtil.setAuth(evSettings.authId, '', evSettings.authPath, evSettings.testUser, evSettings.testPass);
            this.encoding = new VideoEncoding({
                dimensions: '640x360'
            }, {
                appId: this.appId
            });
        },
        teardown: function() {
            authUtil.removeAuth(evSettings.authId, evSettings.authPath);
        }
    });

    q.test('test extends Backbone.Model', 1, function() {
        q.ok(this.encoding instanceof Backbone.Model);
    });

    q.test('test initialize', 2, function() {
        q.strictEqual(this.encoding.appId, this.appId);
        q.deepEqual(this.encoding.config, evSettings);
    });

    q.test('test parse', 1, function() {
        var encodings = {
            foo: 'bar'
        };
        var data = {
            dataSet: {
                encodings: encodings
            }
        };
        q.deepEqual(this.encoding.parse(data), encodings);
    });

    q.test('test getDims', 2, function() {
        var dims = this.encoding.getDims();
        q.strictEqual(dims[0], 640);
        q.strictEqual(dims[1], 360);
    });

    q.test('test getRatio', 1, function() {
        q.strictEqual(this.encoding.getRatio(), 640 / 360);
    });

    q.test('test getWidth', 1, function() {
        q.strictEqual(this.encoding.getWidth(), 640);
    });

    q.test('test getHeight', 1, function() {
        q.strictEqual(this.encoding.getHeight(), 360);
    });

    q.asyncTest('test fetch', 1, function() {
        var videos = new Videos([], {
            appId: this.appId
        });
        videos.fetch({
            success: _.bind(function(collection) {
                this.encoding.set('fetchId', collection.at(0).id);
                this.encoding.fetch({
                    dataType: 'jsonp',
                    success: _.bind(function(model, response) {
                        q.start();
                        console.log(JSON.stringify(model));
                        q.strictEqual(this.encoding.get('encodingId'), response.dataSet.encodings.encodingId);
                    }, this)
                });
            }, this)
        });
    });
});
