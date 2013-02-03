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
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    var EnsembleApp = function(appOptions) {

        // Lame unique id generator
        var appId = Math.floor(Math.random() * 10000000000000001).toString(16);

        appOptions = appOptions || {};

        // Get or create a new cache to store objects specific to EV installation
        // but common across 'app' instances (e.g. videos accessible by a given user)
        var evCache = cacheUtil.caches.get(appOptions.ensembleUrl);
        if (!evCache) {
            evCache = cacheUtil.caches.set(appOptions.ensembleUrl, new cacheUtil.Cache());
        }

        // Add our configuration to the app cache
        cacheUtil.setAppConfig(appId, {
            authId: appOptions.authId || 'ensemble',
            ensembleUrl: appOptions.ensembleUrl || '',
            authPath: appOptions.authPath || '',
            authDomain: appOptions.authDomain || '',
            urlCallback: appOptions.urlCallback || function(url) { return url; },
            pageSize: parseInt(appOptions.pageSize || 100, 10)
        });

        eventsUtil.initEvents(appId);
        this.appEvents = eventsUtil.getEvents(appId);
        this.globalEvents = eventsUtil.getEvents();


        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
            var $field = $(fieldSelector, fieldWrap);
            var fieldView = new FieldView({
                id: fieldWrap.id || appId,
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
