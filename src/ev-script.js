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
        VideoFieldView = require('ev-script/views/video-field'),
        PlaylistFieldView = require('ev-script/views/playlist-field'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed'),
        Root = require('ev-script/models/root'),
        Info = require('ev-script/models/app-info'),
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

        // // Get or create a new cache to store objects specific to EV
        // // installation but common across 'app' instances (e.g. videos
        // // accessible by a given user).
        // var evCache = cacheUtil.caches.get(appOptions.ensembleUrl);
        // if (!evCache) {
        //     evCache = cacheUtil.caches.set(appOptions.ensembleUrl, new cacheUtil.Cache());
        // }

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
        var config = cacheUtil.setConfig(_.extend({}, defaults, appOptions));

        var locale = config.getLocaleCallback();
        // Set locale for moment
        moment.locale(locale);

        // Features depend on asynchronously retreival of data below...so leverage
        // promises to coordinate loading
        var loading = $.Deferred();
        _.extend(this, loading.promise());

        // Create an event aggregator specific to our app
        eventsUtil.initEvents();
        this.appEvents = eventsUtil.getEvents();
        // eventsUtil also provides us with a global event aggregator for events
        // that span app instances
        this.globalEvents = eventsUtil.getEvents();

        var finishLoading = _.bind(function() {

            // Setup globalize
            Globalize.load(likelySubtags);
            Globalize.loadMessages(messages);
            cacheUtil.setI18n(new Globalize(!messages[locale] ? 'en-US' : locale));

            var root = new Root({}, {
                href: config.ensembleUrl + config.apiPath
            });
            cacheUtil.setRoot(root);

            root.fetch({})
            .done(_.bind(function() {
                // TODO - remove
                console.log(root);

                var info = new Info({}, {
                    href: root.getLink('ev:Info/Get').href
                });
                cacheUtil.setInfo(info);

                // Load application info from EV
                info.fetch({})
                .always(_.bind(function() {
                    if (!info.get('applicationVersion')) {
                        loading.reject('Failed to retrieve application info.');
                    } else {
                        // This will initialize and cache an auth object for our app
                        var auth = new EnsembleAuth();
                        cacheUtil.setAuth(auth);

                        // TODO - document and add some flexibility to params (e.g. in addition
                        // to selector allow element or object).
                        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
                            var $field = $(fieldSelector, fieldWrap),
                                fieldOptions = {
                                    id: fieldWrap.id || 'ev-field',
                                    el: fieldWrap,
                                    model: settingsModel,
                                    $field: $field
                                },
                                fieldView;
                            if (settingsModel instanceof VideoSettings) {
                                fieldView = new VideoFieldView(fieldOptions);
                            } else if (settingsModel instanceof PlaylistSettings) {
                                fieldView = new PlaylistFieldView(fieldOptions);
                            } else {
                                throw new Error('Unrecognized settings model type');
                            }
                        };

                        // TODO - document.  See handleField comment too.
                        this.handleEmbed = function(embedWrap, settingsModel) {
                            if (settingsModel instanceof VideoSettings) {
                                var videoEmbed = new VideoEmbedView({
                                    el: embedWrap,
                                    model: settingsModel
                                });
                                videoEmbed.render();
                            } else {
                                var playlistEmbed = new PlaylistEmbedView({
                                    el: embedWrap,
                                    model: settingsModel
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
