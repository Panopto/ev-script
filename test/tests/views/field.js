define(function(require) {

    'use strict';

    var q = QUnit,
        $ = require('jquery'),
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache'),
        eventsUtil = require('ev-script/util/events'),
        evSettings = require('ev-config'),
        VideoSettings = require('ev-script/models/video-settings'),
        VideoEncoding = require('ev-script/models/video-encoding'),
        VideoPickerView = require('ev-script/views/video-picker'),
        VideoSettingsView = require('ev-script/views/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        PlaylistPickerView = require('ev-script/views/playlist-picker'),
        PlaylistSettingsView = require('ev-script/views/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview'),
        BaseView = require('ev-script/views/base'),
        FieldView = require('ev-script/views/field'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        AppInfo = require('ev-script/models/app-info');

    q.module('Testing ev-script/views/field', {
        setup: function() {
            q.stop();
            this.appId = 'ev-script/views/field';
            this.config = evSettings;
            eventsUtil.initEvents(this.appId);
            cacheUtil.setAppConfig(this.appId, this.config);
            this.info = new AppInfo({}, {
                appId: this.appId
            });
            cacheUtil.setAppInfo(this.appId, this.info);
            this.info.fetch({})
            .always(_.bind(function() {
                this.auth = (this.config.authType && this.config.authType === 'forms') ? new FormsAuth(this.appId) : new BasicAuth(this.appId);
                cacheUtil.setAppAuth(this.appId, this.auth);
                this.videoField = new FieldView({
                    el: $('#videoWrap')[0],
                    model: new VideoSettings(),
                    $field: $('#video'),
                    appId: this.appId
                });
                this.playlistField = new FieldView({
                    el: $('#playlistWrap')[0],
                    model: new PlaylistSettings(),
                    $field: $('#playlist'),
                    appId: this.appId
                });
                q.start();
            }, this));
        }
    });

    q.test('test extends BaseView', 2, function() {
        q.ok(this.videoField instanceof BaseView);
        q.ok(this.playlistField instanceof BaseView);
    });

    q.test('test properties', 31, function() {
        // Test video field
        q.strictEqual(this.videoField.appId, this.appId);
        q.deepEqual(this.videoField.config, this.config);
        // FIXME - this bombs out in phantomjs
        // q.deepEqual(this.videoField.appEvents, eventsUtil.getEvents(this.appId));
        q.ok(_.isEqual(this.videoField.appEvents, eventsUtil.getEvents(this.appId)));
        q.deepEqual(this.videoField.info, this.info);
        q.ok(this.videoField.modelClass === VideoSettings);
        q.ok(this.videoField.pickerClass === VideoPickerView);
        q.ok(this.videoField.settingsClass === VideoSettingsView);
        q.ok(this.videoField.previewClass === VideoPreviewView);
        q.ok(this.videoField.encoding instanceof VideoEncoding);
        q.ok(this.videoField.picker instanceof this.videoField.pickerClass);
        q.ok(this.videoField.settings instanceof this.videoField.settingsClass);
        q.ok(_.isFunction(this.videoField.chooseHandler));
        q.ok(_.isFunction(this.videoField.optionsHandler));
        q.ok(_.isFunction(this.videoField.removeHandler));
        q.ok(_.isFunction(this.videoField.previewHandler));
        q.ok(_.isFunction(this.videoField.renderActions));
        // Test playlist field
        q.strictEqual(this.playlistField.appId, this.appId);
        q.deepEqual(this.playlistField.config, this.config);
        // FIXME - this bombs out in phantomjs
        // q.deepEqual(this.playlistField.appEvents, eventsUtil.getEvents(this.appId));
        q.ok(_.isEqual(this.playlistField.appEvents, eventsUtil.getEvents(this.appId)));
        q.deepEqual(this.playlistField.info, this.info);
        q.ok(this.playlistField.modelClass === PlaylistSettings);
        q.ok(this.playlistField.pickerClass === PlaylistPickerView);
        q.ok(this.playlistField.settingsClass === PlaylistSettingsView);
        q.ok(this.playlistField.previewClass === PlaylistPreviewView);
        q.ok(this.playlistField.picker instanceof this.playlistField.pickerClass);
        q.ok(this.playlistField.settings instanceof this.playlistField.settingsClass);
        q.ok(_.isFunction(this.playlistField.chooseHandler));
        q.ok(_.isFunction(this.playlistField.optionsHandler));
        q.ok(_.isFunction(this.playlistField.removeHandler));
        q.ok(_.isFunction(this.playlistField.previewHandler));
        q.ok(_.isFunction(this.playlistField.renderActions));
    });

    // FIXME - needs more cowbell
    q.test('test DOM', 2, function() {
        q.ok(this.videoField.$('.ev-field').length > 0);
        q.ok(this.playlistField.$('.ev-field').length > 0);
    });

});
