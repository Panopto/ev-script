/*global log*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        _ = require('underscore'),
        $ = require('jquery'),
        log = require('loglevel'),
        Globalize = require('globalize'),
        moment = require('moment'),
        likelySubtags = require('json!cldr-data/supplemental/likelySubtags.json'),
        messages = require('json!ev-script/i18n/root/messages.json'),

        // Settings models
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        DropboxSettings = require('ev-script/models/dropbox-settings'),
        QuizSettings = require('ev-script/models/quiz-settings'),

        // Field views
        VideoFieldView = require('ev-script/views/video-field'),
        PlaylistFieldView = require('ev-script/views/playlist-field'),
        DropboxFieldView = require('ev-script/views/dropbox-field'),
        QuizFieldView = require('ev-script/views/quiz-field'),

        // Embed views
        VideoEmbedView = require('ev-script/views/video-embed'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed'),
        DropboxEmbedView = require('ev-script/views/dropbox-embed'),
        QuizEmbedView = require('ev-script/views/quiz-embed'),

        // API response
        Root = require('ev-script/models/root'),
        Info = require('ev-script/models/info'),
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

        var defaults = {
            // Application root of the EV installation.
            ensembleUrl: '',
            // Path to the api under the ensembleUrl.
            apiPath: '/hapi',
            // Number of results to fetch at a time from the server (page size).
            pageSize: 100,
            // The height of our scroll loader. This can be an integer (number
            // of pixels), or css string, e.g. '80%'.
            scrollHeight: null,
            // In scenarios where we have multiple fields on a page we want to
            // automatically hide inactive pickers to preserve screen real
            // estate.  Set to true to enable.
            hidePickers: false,
            // The difference between window dimensions and maximum dialog size.
            dialogMargin: 40,
            // Set this in order to select the default identity provider in the
            // forms auth identity provider dropdown.
            defaultProvider: '',
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
            // Auth options
            authLoginPath: '/app/lti/login.aspx',
            authLogoutPath: '/api/logout',
            authCompleteMessage: 'ev_auth_complete',
            // Logging
            logLevel: 'info'
        };

        var config = _.extend({}, defaults, appOptions);

        // Set logging
        log.setDefaultLevel(config.logLevel);

        log.info('[ev-script] Initializing app');
        log.debug('[ev-script] Config:');
        log.debug(config);

        var locale = config.getLocaleCallback();
        log.debug('[ev-script] Locale: ' + locale);
        // Set locale for moment
        moment.locale(locale);

        // Features depend on asynchronously retreival of data below...so leverage
        // promises to coordinate loading
        var loading = $.Deferred();
        _.extend(this, loading.promise());

        // Create an event aggregator specific to our app
        this.events = eventsUtil.getEvents();

        var loadApp = _.bind(function() {

            log.info('[ev-script] Loading app');

            cacheUtil.setConfig(config);

            cacheUtil.setI18n(new Globalize(!messages[locale] ? 'en-US' : locale));

            var root = new Root({}, {
                href: config.ensembleUrl + config.apiPath
            });
            cacheUtil.setRoot(root);

            root.fetch({})
            .done(_.bind(function() {
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
                        // TODO - document and add some flexibility to params (e.g. in addition
                        // to selector allow element or object).
                        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
                            log.debug('[ev-script] handleField');
                            log.debug(arguments);
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
                            } else if (settingsModel instanceof DropboxSettings) {
                                fieldView = new DropboxFieldView(fieldOptions);
                            } else if (settingsModel instanceof QuizSettings) {
                                fieldView = new QuizFieldView(fieldOptions);
                            } else {
                                throw new Error('Unrecognized settings model type');
                            }
                        };

                        // TODO - document.  See handleField comment too.
                        this.handleEmbed = function(embedWrap, settingsModel) {
                            log.debug('[ev-script] handleEmbed');
                            log.debug(arguments);
                            if (settingsModel instanceof VideoSettings) {
                                var videoEmbed = new VideoEmbedView({
                                    el: embedWrap,
                                    model: settingsModel
                                });
                                videoEmbed.render();
                            } else if (settingsModel instanceof PlaylistSettings) {
                                var playlistEmbed = new PlaylistEmbedView({
                                    el: embedWrap,
                                    model: settingsModel
                                });
                                playlistEmbed.render();
                            } else if (settingsModel instanceof DropboxSettings) {
                                var dropboxEmbed = new DropboxEmbedView({
                                    el: embedWrap,
                                    model: settingsModel
                                });
                                dropboxEmbed.render();
                            } else if (settingsModel instanceof QuizSettings) {
                                var quizEmbed = new QuizEmbedView({
                                    el: embedWrap,
                                    model: settingsModel
                                });
                                quizEmbed.render();
                            } else {
                                throw new Error('Unrecognized settings model type');
                            }
                        };

                        this.getEmbedCode = function(settings) {
                            log.debug('[ev-script] getEmbedCode');
                            log.debug(arguments);
                            var $div = $('<div/>');
                            if (settings.type === 'video') {
                                this.handleEmbed($div[0], new VideoSettings(settings));
                            } else if (settings.type === 'playlist') {
                                this.handleEmbed($div[0], new PlaylistSettings(settings));
                            } else if (settings.type === 'dropbox') {
                                this.handleEmbed($div[0], new DropboxSettings(settings));
                            } else if (settings.type === 'quiz') {
                                this.handleEmbed($div[0], new QuizSettings(settings));
                            } else {
                                throw new Error('Unrecognized settings model type');
                            }
                            return $div.html();
                        };

                        log.info('[ev-script] App loaded');
                        this.events.trigger('appLoaded');
                        loading.resolve();
                    }
                }, this));
            }, this))
            .fail(_.bind(function() {
                loading.reject('An error occurred while connecting to the Ensemble Video API');
            }, this));

        }, this);

        // Load messages for locale
        log.info('[ev-script] Retreiving localized messages');
        $.getJSON(config.i18nPath + '/' + locale + '/messages.json')
        .done(function(data, status, xhr) {
            _.extend(messages, data);

            // Setup globalize
            Globalize.load(likelySubtags);
            Globalize.loadMessages(messages);

            loadApp();
        })
        .fail(function(xhr, status, error) {
            loadApp();
        });
    };

    return {
        VideoSettings: VideoSettings,
        PlaylistSettings: PlaylistSettings,
        DropboxSettings: DropboxSettings,
        QuizSettings: QuizSettings,
        EnsembleApp: EnsembleApp
    };

});
