define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        testUtil = require('test/util'),
        evSettings = require('ev-config'),
        Videos = require('ev-script/collections/videos'),
        VideoEncoding = require('ev-script/models/video-encoding');

    q.module('Testing ev-script/models/video-encoding', {
        setup: testUtil.setupHelper('ev-script/models/video-encoding', {
            setupAuth: function() {
                this.encoding = new VideoEncoding({
                    dimensions: '640x360'
                }, {
                    appId: this.appId
                });
            }
        }),
        teardown: testUtil.teardownHelper()
    });

    q.test('test extends Backbone.Model', 1, function() {
        q.ok(this.encoding instanceof Backbone.Model);
    });

    q.test('test initialize', 2, function() {
        q.strictEqual(this.encoding.appId, this.appId);
        q.deepEqual(this.encoding.config, evSettings);
    });

    q.test('test parse', 2, function() {
        q.deepEqual(this.encoding.parse({
            videos: {
                videoEncodings: {
                    encodingId: 'foo'
                }
            }
        }), {
            encodingId: 'foo'
        });
        q.deepEqual(this.encoding.parse({
            videos: {
                videoEncodings: [
                    {
                        bitrate: "10"
                    }, {
                        bitrate: "30"
                    }, {
                        bitrate: "20"
                    }
                ]
            }
        }), {
            bitrate: "30"
        });
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
                    success: _.bind(function(model, response) {
                        console.log(JSON.stringify(model));
                        q.strictEqual(this.encoding.get('encodingId'), response.videos.videoEncodings.encodingId);
                        q.start();
                    }, this),
                    error: function(collection, response, options) {
                        q.ok(false, response.status);
                        q.start();
                    }
                });
            }, this),
            error: function(collection, response, options) {
                q.ok(false, response.status);
                q.start();
            }
        });
    });
});
