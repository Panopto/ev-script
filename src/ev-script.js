/*global requirejs*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        _ = require('underscore'),
        $ = require('jquery'),
        Globalize = require('globalize'),
        moment = require('moment'),
        likelySubtags = require('json!cldr-data/supplemental/likelySubtags.json'),
        messages = require('json!ev-script/i18n/root/messages.json'),
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        FieldView = require('ev-script/views/field'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed'),
        Root = require('ev-script/models/root'),
        AppInfo = require('ev-script/models/app-info'),
        EnsembleAuth = require('ev-script/auth/ensemble/auth'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    // Require jquery.cookie here so it is bundled. It is used in our factory
    // for configuration of i18n.
    require('jquery.cookie');

    // Load globalize deps
    require('cldr/supplemental');
    require('cldr/unresolved');
    require('globalize/message');

    var EnsembleApp = function(appOptions) {

        // TODO - Do I really need this anymore?  IIRC it was to deal w/
        // multiple instances of this "app" on a page.
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
            // Path to the api under the ensembleUrl.
            apiPath: '/hapi',
            // Models/collections will typically fetch directly from the API,
            // but this method is called in case that needs to be overridden
            // (e.g. in cross-domain scenarios where we're using a proxy).
            urlCallback: function(url) { return url; },
            // Number of results to fetch at a time from the server (page size).
            pageSize: 100,
            // The height of our scroll loader. This can be an integer (number
            // of pixels), or css string, e.g. '80%'.
            scrollHeight: null,
            // In scenarios where we have multiple fields on a page we want to
            // automatically hide inactive pickers to preserve screen real
            // estate.  Set to false to disable.
            hidePickers: true,
            // The difference between window dimensions and maximum dialog size.
            dialogMargin: 40,
            // Set this in order to select the default identity provider in the
            // forms auth identity provider dropdown.
            defaultProvider: '',
            // Set this in order to select the default width in video settings
            defaultVideoWidth: 848,
            // Location for plupload flash runtime
            pluploadFlashPath: '',
            // Callbacks to set locale and date/time formats
            getLocaleCallback: function() { return 'en-US'; },
            getDateFormatCallback: function() { return 'MM/DD/YYYY'; },
            getTimeFormatCallback: function() { return 'hh:mmA'; },
            getDateTimeFormat: function() {
                return this.getDateFormatCallback() + ' ' + this.getTimeFormatCallback();
            },
            // Path to i18n folder
            i18nPath: 'i18n',

            // TODO - Given third-party cookie restrictions...modify
            // ensembleAuth to immediately open first-party window for login?
            // Do same w/ logout (rather than using api)?
            // Options used for 'ensemble' authentication
            ensembleAuthOptions: {
                // Path to ensemble login page when using 'ensemble'
                // authentication
                authPath: '/app/lti/login.aspx',
                authCompleteMessage: 'ev_auth_complete'
            }
        };

        // Add our configuration to the app cache...this is specific to this
        // 'app' instance.  There may be multiple instances on a single page w/
        // unique settings.
        var config = cacheUtil.setAppConfig(appId, _.extend({}, defaults, appOptions));

        var locale = config.getLocaleCallback();
        // Set locale for moment
        moment.locale(locale);

        // Features depend on asynchronously retreival of data below...so leverage
        // promises to coordinate loading
        var loading = $.Deferred();
        _.extend(this, loading.promise());

        // Create an event aggregator specific to our app
        eventsUtil.initEvents(appId);
        this.appEvents = eventsUtil.getEvents(appId);
        // eventsUtil also provides us with a global event aggregator for events
        // that span app instances
        this.globalEvents = eventsUtil.getEvents();

        var finishLoading = _.bind(function() {

            // Setup globalize
            Globalize.load(likelySubtags);
            Globalize.loadMessages(messages);
            cacheUtil.setAppI18n(appId, new Globalize(!messages[locale] ? 'en-US' : locale));

            var root = new Root({}, {
                href: config.ensembleUrl + config.apiPath,
                appId: appId,
            });
            cacheUtil.setAppRoot(appId, root);

            root.fetch({})
            .done(_.bind(function() {
                console.log(root);

                var info = new AppInfo({}, {
                    href: root.links['ev:Info'].href,
                    appId: appId
                });
                cacheUtil.setAppInfo(appId, info);

                // Load application info from EV
                info.fetch({})
                .always(_.bind(function() {
                    if (!info.get('applicationVersion')) {
                        loading.reject('Failed to retrieve application info.');
                    } else {
                        // This will initialize and cache an auth object for our app
                        var auth = new EnsembleAuth(appId);
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
                                videoEmbed.render();
                            } else {
                                var playlistEmbed = new PlaylistEmbedView({
                                    el: embedWrap,
                                    model: settingsModel,
                                    appId: appId
                                });
                                playlistEmbed.render();
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
            }, this))
            .fail(_.bind(function() {
                loading.reject('An error occurred while connecting to the Ensemble Video API');
            }, this));

        }, this);

        // Load messages for locale
        $.getJSON(config.i18nPath + '/' + locale + '/messages.json')
        .done(function(data, status, xhr) {
            _.extend(messages, data);
            finishLoading();
        })
        .fail(function(xhr, status, error) {
            finishLoading();
        });
    };

    return {
        VideoSettings: VideoSettings,
        PlaylistSettings: PlaylistSettings,
        EnsembleApp: EnsembleApp
    };

});
