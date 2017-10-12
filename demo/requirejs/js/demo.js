(function() {

    'use strict';

    require.config({
        baseUrl: '../../node_modules',
        paths: {
            'ev-script': '../../dist/ev-script',
            'jquery':  'jquery/dist/jquery',
            'jquery-ui': 'jquery-ui',
            'jquery.cookie': 'jquery.cookie/jquery.cookie',
            'jquery.plupload.queue': 'plupload/js/jquery.plupload.queue/jquery.plupload.queue',
            'moxie': 'plupload/js/moxie',
            'plupload': 'plupload/js/plupload.dev',
            'underscore': 'underscore/underscore',
            'backbone': 'backbone/backbone',
            'ev-config': '../../ev-config'
        },
        map: {
            '*': {
                'plupload': 'plupload-adapter'
            },
            'plupload-adapter': {
                'plupload': 'plupload'
            }
        },
        shim: {
            'jquery.plupload.queue': {
                deps: ['jquery', 'plupload'],
                init: function(jquery, plupload) {
                    window.plupload = plupload;
                }
            }
        }
    });

    // plupload when loaded as module doesn't attach a global, which jquery.plupload.queue requires
    // so we use an adapter that does so
    define('plupload-adapter', ['plupload'], function(plupload) {
        window.plupload = plupload;

        return plupload;
    });

    require(['ev-config', 'ev-script', 'jquery', 'underscore'], function(evSettings, EV, $, _) {

        var app = new EV.EnsembleApp(_.extend(evSettings, {
            scrollHeight: 600,
            i18nPath: '../../src/ev-script/i18n'
        }));

        app.appEvents.bind('fieldUpdated', function($field, value) {
            var $videoEmbed = $('.video-embed');
            var $playlistEmbed = $('.playlist-embed');
            if ($field[0].id === 'video') {
                if (value) {
                    app.handleEmbed($videoEmbed, new EV.VideoSettings(value));
                } else {
                    $videoEmbed.html('');
                }
            } else if ($field[0].id === 'playlist') {
                if (value) {
                    app.handleEmbed($playlistEmbed, new EV.PlaylistSettings(value));
                } else {
                    $playlistEmbed.html('');
                }
            }
        });

        $(window.document).ready(function() {
            app.done(function() {
                app.handleField($('#videoWrap')[0], new EV.VideoSettings(), '#video');
                app.handleField($('#playlistWrap')[0], new EV.PlaylistSettings(), '#playlist');
            }).fail(function(message) {
                window.alert(message);
            });
        });
    });

}());
