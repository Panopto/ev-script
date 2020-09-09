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
        cacheUtil = require('ev-script/util/cache'),

        // Auth
        AuthUtil = require('ev-script/util/auth'),

        supportedLanguages = [ 'en', 'en-US', 'es', 'es-MX', 'fr', 'fr-FR' ];

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
                // Specifies the current institution for identity provider selection.
                institutionId: '',
                // Callbacks to set date/time formats
                getDateFormatCallback: function() { return 'MM/DD/YYYY'; },
                getTimeFormatCallback: function() { return 'hh:mmA'; },
                getDateTimeFormat: function() {
                    return this.getDateFormatCallback() + ' ' + this.getTimeFormatCallback();
                },
                // Path to i18n folder
                i18nPath: '',
                // Path to images folder
                imagePath: '',
                // Logging
                logLevel: 'info',
                // Application root
                appRoot: window.location.pathname.replace(/\/auth.*/, ''),
                // Current user id
                currentUserId: '',
                // oauth2 client id
                clientId: '',
                // Are third-party cookies available?
                tpcEnabled: true,
                // Use oauth2 redirect rather than popout?
                useAuthRedirect: false,
                // State to be passed in oauth redirect
                state: undefined
            },
            config,
            events,
            i18n,
            setLocale,
            resetLocale,
            loading,
            userManager,
            loadApp,
            auth,
            root;

        config = _.extend({}, defaults, appOptions);

        if (!config.clientId) {
            throw new Error('clientId is required');
        }

        // Make sure appRoot has trailing slash
        config.appRoot = /\/$/.test(config.appRoot) ? config.appRoot : config.appRoot + '/';

        // Setup globalize
        Globalize.load(likelySubtags);

        // Set logging
        log.setDefaultLevel(config.logLevel);

        log.info('[ev-script] Initializing app');
        log.debug('[ev-script] Config:');
        log.debug(config);

        // Features depend on asynchronously retreival of data below...so leverage
        // promises to coordinate loading
        loading = $.Deferred();
        _.extend(this, loading.promise());

        // Create an event aggregator specific to our app
        this.events = events = eventsUtil.getEvents();

        setLocale = function(silent) {
            var deferred = $.Deferred(),
                currentUser,
                locale,
                localizationPreferences,
                desiredLanguages;

            root.promise.done(function() {
                currentUser = root.getUser();
                if (currentUser) {
                    localizationPreferences = currentUser
                        .getEmbedded('ev:LocalizationPreferences/Get');
                    locale = localizationPreferences.get('language');
                } else if (navigator.languages) {
                    desiredLanguages = _.intersection(navigator.languages, supportedLanguages);
                    locale = desiredLanguages[0];
                }
                if (!localizationPreferences) {
                    localizationPreferences = root
                        .getEmbedded('ev:Brandings/Current')
                        .getEmbedded('ev:LocalizationPreferences/Get');
                    if (!locale) {
                        locale = localizationPreferences.get('language');
                    }
                }
                config.getDateFormatCallback = function() {
                    return localizationPreferences.get('dateFormat').toUpperCase();
                };
                config.getTimeFormatCallback = function() {
                    return localizationPreferences.get('timeFormat').replace('tt', 'A');
                };

                log.debug('[ev-script] Locale: ' + locale);

                if (config.locale === locale) {
                    deferred.resolve(cacheUtil.getI18n());
                    return deferred.promise();
                }

                config.locale = locale;
                moment.locale(locale);

                // Load messages for locale
                log.info('[ev-script] Retrieving localized messages');
                $.getJSON(config.i18nPath + '/' + locale + '/messages.json')
                .done(function(data, status, xhr) {
                    _.extend(messages, data);

                    Globalize.loadMessages(messages);

                    i18n = new Globalize(!messages[locale] ? 'en-US' : locale);
                    cacheUtil.setI18n(i18n);

                    if (!silent) {
                        events.trigger('localeUpdated', i18n);
                    }

                    deferred.resolve(i18n);
                })
                .fail(function(xhr, status, error) {
                    deferred.reject();
                    throw new Error('Failed to load i18n messages!');
                });
            });


            return deferred.promise();
        };

        resetLocale = function() {
            root.promise.done(function() {
                var currentI18n = _.extend({}, i18n);
                log.debug('[ev-script] Resetting locale');
                setLocale()
                .then(function(newI18n) {
                    if (currentI18n.cldr.locale !== newI18n.cldr.locale) {
                        log.debug('[ev-script] Locale reset');
                        events.trigger('localeReset');
                    }
                });
            });
        };

        loadApp = function() {

            log.info('[ev-script] Loading app');

            if (!config.institutionId) {
                throw new Error('institutionId is required');
            }

            cacheUtil.setAuth(auth);

            cacheUtil.setConfig(config);

            // Setup our api root resource
            root = new Root({}, {
                href: config.ensembleUrl + config.apiPath
            });

            cacheUtil.setRoot(root);

            // Auth events may impact rendered localized messages so reload
            events.on('loggedIn', resetLocale);
            events.on('loggedOut', resetLocale);

            root.fetch({})
            .done(function() {
                var info = new Info({}, {
                        href: root.getLink('ev:Info/Get').href
                    });

                cacheUtil.setInfo(info);

                // Load application info from EV
                info.fetch({})
                .always(function() {
                    if (!info.get('applicationVersion')) {
                        loading.reject('Failed to retrieve application info.');
                    } else {
                        setLocale(true)
                        .done(function(data, status, xhr) {
                            log.info('[ev-script] App loaded');
                            events.trigger('appLoaded');
                            loading.resolve();
                        })
                        .fail(function(xhr, status, error) {
                            throw new Error('Failed to load app!');
                        });
                    }
                });
            })
            .fail(function() {
                loading.reject('An error occurred while connecting to the Ensemble Video API');
            });
        };

        // Setup auth
        auth = new AuthUtil({
            config: config,
            events: events,
            callback: loadApp
        });

        Backbone.history.start({
            pushState: true,
            silent: false,
            root: config.appRoot
        });

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

            log.debug('[ev-script] handleField');
            log.debug(arguments);

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

        this.getI18n = function() {
            return i18n;
        };

        this.getUser = function() {
            return auth.getUser();
        };

        this.getConfig = function() {
            return config;
        };
    };

    return {
        VideoSettings: VideoSettings,
        PlaylistSettings: PlaylistSettings,
        DropboxSettings: DropboxSettings,
        QuizSettings: QuizSettings,
        EnsembleApp: EnsembleApp
    };

});
