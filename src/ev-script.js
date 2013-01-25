/*global define*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        _ = require('underscore'),
        $ = require('jquery'),
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        FieldView = require('ev-script/views/field'),
        AuthView = require('ev-script/views/auth'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed');

    var EnsembleApp = function(appOptions) {

        appOptions = appOptions || {};

        // FIXME - break up the following into proper objects
        // I *really* need to find a better way to pass this stuff to dependencies
        // so I don't have to worry whether or not they have them
        // I'm wondering if it's possible to wrap initializers and pass an 'app'
        // object (or something) containing all the stuff below that used to be top level
        // before I started breaking this up.
        var config = {
                authId: appOptions.authId || 'ensemble',
                ensembleUrl: appOptions.ensembleUrl || '',
                authPath: appOptions.authPath || '',
                authDomain: appOptions.authDomain || '',
                urlCallback: appOptions.urlCallback || function(url) { return url; },
                pageSize: parseInt(appOptions.pageSize || 100, 10)
            },
            auth = {
                cookieOptions: {
                    path: config.authPath
                },
                getUser: function() {
                    return $.cookie(config.authId + '-user');
                },
                setAuth: function(username, password) {
                    username += (config.authDomain ? '@' + config.authDomain : '');
                    $.cookie(config.authId + '-user', username, _.extend({}, auth.cookieOptions));
                    $.cookie(config.authId + '-pass', password, _.extend({}, auth.cookieOptions));
                    eventAggr.trigger('authSet');
                },
                removeAuth: function() {
                    $.cookie(config.authId + '-user', null, _.extend({}, auth.cookieOptions));
                    $.cookie(config.authId + '-pass', null, _.extend({}, auth.cookieOptions));
                    eventAggr.trigger('authRemoved');
                },
                hasAuth: function() {
                    return $.cookie(config.authId + '-user') && $.cookie(config.authId + '-pass');
                },
                ajaxError: function(xhr, authCallback) {
                    if (xhr.status === 401) {
                        auth.removeAuth();
                        var authView = new AuthView({
                            el: this.el,
                            submitCallback: authCallback,
                            eventAggr: eventAggr,
                            config: config,
                            auth: auth
                        });
                    } else if (xhr.status === 500) {
                        window.alert('It appears there is an issue with the Ensemble Video installation.');
                    } else {
                        window.alert('An unexpected error occurred.  Check the server log for more details.');
                    }
                }
            },
            cache = {
                videosCache: [],
                orgsCache: [],
                libsCache: [],
                playlistsCache: []
            },
            eventAggr = _.extend({}, Backbone.Events);

        this.handleField = function(fieldWrap, settingsModel, fieldSelector) {
            var $field = $(fieldSelector, fieldWrap);
            var fieldView = new FieldView({
                id: fieldWrap.id,
                el: fieldWrap,
                model: settingsModel,
                $field: $field,
                config: config,
                auth: auth,
                cache: cache,
                eventAggr: eventAggr
            });
        };

        this.handleEmbed = function(embedWrap, settingsModel) {
            if (settingsModel instanceof VideoSettings) {
                var videoEmbed = new VideoEmbedView({
                    el: embedWrap,
                    model: settingsModel,
                    config: config
                });
            } else {
                var playlistEmbed = new PlaylistEmbedView({
                    el: embedWrap,
                    model: settingsModel,
                    config: config
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
