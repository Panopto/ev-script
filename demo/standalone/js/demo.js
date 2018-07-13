/*global EV,evSettings,jQuery,document,window,_*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp(_.extend(evSettings, {
        hidePickers: false,
        scrollHeight: 200,
        fitToParent: true,
        getLocaleCallback: function() { return 'en-US'; },
        getDateFormatCallback: function() { return 'DD/MM/YYYY'; },
        getTimeFormatCallback: function() { return 'hh:mm A'; },
        i18nPath: '../../src/ev-script/i18n'
    }));

    app.events.bind('fieldUpdated', function($field, value) {
        var $embed = $('.embed');
        if (value) {
            if ($field[0].id === 'video') {
                app.handleEmbed($embed, new EV.VideoSettings(value));
            } else if ($field[0].id === 'playlist') {
                app.handleEmbed($embed, new EV.PlaylistSettings(value));
            } else if ($field[0].id === 'dropbox') {
                app.handleEmbed($embed, new EV.DropboxSettings(value));
            } else if ($field[0].id === 'quiz') {
                app.handleEmbed($embed, new EV.QuizSettings(value));
            }
            console.log('Embed code: ' + app.getEmbedCode(value));
        } else {
            $embed.html('');
        }
    });

    $(document).ready(function() {
        var $container = $('.chooserContainer'),
            $tabs = $('#tabs'),
            playlistSelected = false,
            dropboxSelected = false,
            quizSelected = false,
            resize = function(event) {
                $container.height($(window).height() * 0.8);
                $tabs.tabs('refresh');
            };
        $(window).resize(resize);
        app.done(function() {
            app.handleField($('#videoWrap')[0], new EV.VideoSettings(), '#video');
            $tabs.tabs({
                heightStyle: 'fill',
                create: function() {
                    // Don't show tabs until created to avoid unformatted content flash
                    $tabs.show();
                },
                activate: function(e, ui) {
                    // Initialize playlist content once (and only once) the playlist tab is selected
                    if (!playlistSelected && ui.newTab.index() === 1) {
                        playlistSelected = true;
                        app.handleField($('#playlistWrap')[0], new EV.PlaylistSettings(), '#playlist');
                    }
                    if (!dropboxSelected && ui.newTab.index() === 2) {
                        dropboxSelected = true;
                        app.handleField($('#dropboxWrap')[0], new EV.DropboxSettings(), '#dropbox');
                    }
                    if (!quizSelected && ui.newTab.index() === 3) {
                        quizSelected = true;
                        app.handleField($('#quizWrap')[0], new EV.QuizSettings(), '#quiz');
                    }
                }
            });
            resize();
        }).fail(function(message) {
            window.alert(message);
        });
    });

}(jQuery));
