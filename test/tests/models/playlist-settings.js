define(function(require) {

    'use strict';

    var q = QUnit,
        Backbone = require('backbone'),
        PlaylistSettings = require('ev-script/models/playlist-settings');

    q.module('Testing ev-script/models/playlist-settings', {
        setup: function() {
            this.settings = new PlaylistSettings();
        }
    });

    q.test('test extends Backbone.Model', 1, function() {
        q.ok(this.settings instanceof Backbone.Model);
    });

    q.test('test properties', 2, function() {
        q.strictEqual(this.settings.get('type'), 'playlist');
        q.strictEqual(this.settings.get('search'), '');
    });

});
