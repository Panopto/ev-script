define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        evSettings = require('ev-config'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events'),
        Videos = require('ev-script/collections/videos'),
        VideoEncoding = require('ev-script/models/video-encoding'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        BasicAuth = require('ev-script/auth/basic/auth');

    q.module('Testing ev-script/models/video-encoding', {
        setup: function() {
            this.appId = 'ev-script/models/video-encoding';
            eventsUtil.initEvents(this.appId);
            this.config = _.extend({}, evSettings);
            cacheUtil.setAppConfig(this.appId, this.config);
            this.auth = (this.config.authType && this.config.authType === 'forms') ? new FormsAuth(this.appId) : new BasicAuth(this.appId);
            cacheUtil.setAppAuth(this.appId, this.auth);
            this.encoding = new VideoEncoding({
                dimensions: '640x360'
            }, {
                appId: this.appId
            });
            if (!this.auth.isAuthenticated()) {
                q.stop();
                this.auth.login({
                    username: evSettings.testUser,
                    password: evSettings.testPass
                })
                .then(function() {
                    q.start();
                });
            }
        },
        teardown: function() {
            if (this.auth.isAuthenticated()) {
                q.stop();
                this.auth.logout()
                .always(function() {
                    q.start();
                });
            }
        }
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
