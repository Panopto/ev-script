define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        Backbone = require('backbone'),
        VideoSettings = require('ev-script/models/video-settings');

    q.module('Testing ev-script/models/video-settings', {
        setup: function() {
            this.settings = new VideoSettings();
        }
    });

    q.test('test extends Backbone.Model', 1, function() {
        q.ok(this.settings instanceof Backbone.Model);
    });

    q.test('test properties', 7, function() {
        q.strictEqual(this.settings.get('type'), 'video');
        q.strictEqual(this.settings.get('search'), '');
        q.strictEqual(this.settings.get('sourceId'), 'content');
        q.ok(_.has(this.settings.attributes, 'showtitle'));
        q.ok(_.has(this.settings.attributes, 'autoplay'));
        q.ok(_.has(this.settings.attributes, 'showcaptions'));
        q.ok(_.has(this.settings.attributes, 'hidecontrols'));
    });

});
