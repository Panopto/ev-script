/*global define*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        _ = require('underscore'),
        $ = require('jquery'),
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        FieldView = require('ev-script/views/field'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed'),
        configUtil = require('ev-script/util/config'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    var EnsembleApp = function(appOptions) {

        // Lame unique id generator
        var appId = Math.floor(Math.random() * 10000000000000001).toString(16);

        appOptions = appOptions || {};

        configUtil.setConfig(appId, {
            authId: appOptions.authId || 'ensemble',
            ensembleUrl: appOptions.ensembleUrl || '',
            authPath: appOptions.authPath || '',
            authDomain: appOptions.authDomain || '',
            urlCallback: appOptions.urlCallback || function(url) { return url; },
            pageSize: parseInt(appOptions.pageSize || 100, 10)
        });
        eventsUtil.initEvents(appId);
        cacheUtil.initAppCache(appOptions.ensembleUrl);

        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
            var $field = $(fieldSelector, fieldWrap);
            var fieldView = new FieldView({
                id: fieldWrap.id,
                el: fieldWrap,
                model: settingsModel,
                $field: $field,
                appId: appId
            });
        };

        this.handleEmbed = function(embedWrap, settingsModel) {
            if (settingsModel instanceof VideoSettings) {
                var videoEmbed = new VideoEmbedView({
                    el: embedWrap,
                    model: settingsModel,
                    appId: appId
                });
            } else {
                var playlistEmbed = new PlaylistEmbedView({
                    el: embedWrap,
                    model: settingsModel,
                    appId: appId
                });
            }
        };

    };

    return {
        VideoSettings: VideoSettings,
        PlaylistSettings: PlaylistSettings,
        EnsembleApp: EnsembleApp
    };

});
