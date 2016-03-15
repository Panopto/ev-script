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
        AppInfo = require('ev-script/models/app-info'),
        BasicAuth = require('ev-script/auth/basic/auth'),
        FormsAuth = require('ev-script/auth/forms/auth'),
        NoneAuth = require('ev-script/auth/none/auth'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    var EnsembleApp = function(appOptions) {

        // Lame unique id generator
        var appId = Math.floor(Math.random() * 10000000000000001).toString(16);

        // Get or create a new cache to store objects specific to EV
        // installation but common across 'app' instances (e.g. videos
        // accessible by a given user).
        var evCache = cacheUtil.caches.get(appOptions.ensembleUrl);
        if (!evCache) {
            evCache = cacheUtil.caches.set(appOptions.ensembleUrl, new cacheUtil.Cache());
        }

        var defaults = {
            // Application root of the EV installation.
            ensembleUrl: '',
            // Cookie path.
            authPath: '',
            // Models/collections will typically fetch directly from the API,
            // but this method is called in case that needs to be overridden
            // (e.g. in cross-domain scenarios where we're using a proxy).
            urlCallback: function(url) { return url; },
            // Number of results to fetch at a time from the server (page size).
            pageSize: 100,
            // The height of our scroll loader. This can be an integer (number
            // of pixels), or css string, e.g. '80%'.
            scrollHeight: null,
            // If true, content will try to resize to fit parent container.
            fitToParent: false,
            // In scenarios where we have multiple fields on a page we want to
            // automatically hide inactive pickers to preserve screen real
            // estate.  Set to false to disable.
            hidePickers: true,
            // The difference between window dimensions and maximum dialog size.
            dialogMargin: 40,
            // This can be 'forms', 'basic' (default) or 'none' (in which case
            // an access denied message is displayed and user is not prompted
            // to authenticate).
            authType: 'basic',
            // Set this in order to select the default identity provider in the
            // forms auth identity provider dropdown.
            defaultProvider: '',
            // Set this in order to select the default width in video settings
            defaultVideoWidth: '',
            // Location for plupload flash runtime
            pluploadFlashPath: ''
        };

        // Add our configuration to the app cache...this is specific to this
        // 'app' instance.  There may be multiple instances on a single page w/
        // unique settings.
        var config = cacheUtil.setAppConfig(appId, _.extend({}, defaults, appOptions));

        // Create an event aggregator specific to our app
        eventsUtil.initEvents(appId);
        this.appEvents = eventsUtil.getEvents(appId);
        // eventsUtil also provides us with a global event aggregator for events
        // that span app instances
        this.globalEvents = eventsUtil.getEvents();

        // Features depend on info asynchronously retreived below...so leverage
        // promises to coordinate loading
        var loading = $.Deferred();
        _.extend(this, loading.promise());

        var info = new AppInfo({}, {
            appId: appId
        });
        cacheUtil.setAppInfo(appId, info);
        info.fetch({})
        .always(_.bind(function() {
            // This is kinda lazy...but this will only be set in 3.6+ versions
            // so we don't actually need to check the version number
            if (!info.get('ApplicationVersion') && config.authType === 'forms') {
                loading.reject('Configured to use forms authentication against a pre-3.6 API.');
            } else {
                // This will initialize and cache an auth object for our app
                var auth;
                switch (config.authType) {
                    case 'forms':
                        auth = new FormsAuth(appId);
                        break;
                    case 'none':
                        auth = new NoneAuth(appId);
                        break;
                    default:
                        auth = new BasicAuth(appId);
                        break;
                }
                cacheUtil.setAppAuth(appId, auth);

                // TODO - document and add some flexibility to params (e.g. in addition
                // to selector allow element or object).
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

                // TODO - document.  See handleField comment too.
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

                this.getEmbedCode = function(settings) {
                    var $div = $('<div/>');
                    if (settings.type === 'video') {
                        this.handleEmbed($div[0], new VideoSettings(settings));
                    } else {
                        this.handleEmbed($div[0], new PlaylistSettings(settings));
                    }
                    return $div.html();
                };

                this.appEvents.trigger('appLoaded');
                loading.resolve();
            }
        }, this));
    };

    return {
        VideoSettings: VideoSettings,
        PlaylistSettings: PlaylistSettings,
        EnsembleApp: EnsembleApp
    };

});
