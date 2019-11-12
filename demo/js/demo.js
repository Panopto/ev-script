/*global EV,evSettings,jQuery,document,window,_*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp(_.extend(evSettings, {
        scrollHeight: 200,
        fitToParent: true,
        getLocaleCallback: function() { return 'en-US'; },
        getDateFormatCallback: function() { return 'DD/MM/YYYY'; },
        getTimeFormatCallback: function() { return 'hh:mm A'; },
        i18nPath: '../../src/ev-script/i18n'
    }));

    // Sample default overrides
    // EV.DropboxSettings.prototype.defaults.width = '480';
    // EV.DropboxSettings.prototype.defaults.height = '820';
    // EV.DropboxSettings.prototype.defaults.embedtype = 'responsive';
    // EV.PlaylistSettings.prototype.defaults.embedtype = 'responsive';
    // EV.PlaylistSettings.prototype.defaults.forceembedtype = true;

    app.events.bind('fieldUpdated', function($field, value) {
        var $embeds = $('.embed'),
            type = $field[0].id,
            $embed = $embeds.filter('.' + type);
        if (value) {
            if (type === 'video') {
                app.handleEmbed($embed, new EV.VideoSettings(value));
            } else if (type === 'playlist') {
                app.handleEmbed($embed, new EV.PlaylistSettings(value));
            } else if (type === 'dropbox') {
                app.handleEmbed($embed, new EV.DropboxSettings(value));
            } else if (type === 'quiz') {
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
            $videoWrap = $('#videoWrap'),
            $playlistWrap = $('#playlistWrap'),
            $quizWrap = $('#quizWrap'),
            $dropboxWrap = $('#dropboxWrap'),
            playlistSelected = false,
            dropboxSelected = false,
            quizSelected = false,
            resize = function(event) {
                $container.height($(window).height() * 0.8);
                $tabs.tabs('refresh');
            };
        $(window).resize(resize);
        app.done(function() {
            app.handleField($videoWrap[0], new EV.VideoSettings(), '#video');
            $('.action-choose', $videoWrap).click();
            $tabs.tabs({
                heightStyle: 'fill',
                create: function() {
                    // Don't show tabs until created to avoid unformatted content flash
                    $tabs.show();
                },
                activate: function(e, ui) {
                    var $embeds = $('.embed');
                    $embeds.hide();
                    if (ui.newTab.index() === 0) {
                        // Automatically open chooser "folder"
                        $('.action-choose', $videoWrap).click();
                        $embeds.filter('.video').show();
                    }
                    // Initialize playlist content once (and only once) the playlist tab is selected
                    if (ui.newTab.index() === 1) {
                        if (!playlistSelected) {
                            playlistSelected = true;
                            app.handleField($playlistWrap[0], new EV.PlaylistSettings(), '#playlist');
                        }
                        $('.action-choose', $playlistWrap).click();
                        $embeds.filter('.playlist').show();
                    }
                    if (ui.newTab.index() === 2) {
                        if (!dropboxSelected) {
                            dropboxSelected = true;
                            app.handleField($dropboxWrap[0], new EV.DropboxSettings(), '#dropbox');
                        }
                        $('.action-choose', $dropboxWrap).click();
                        $embeds.filter('.dropbox').show();
                    }
                    if (ui.newTab.index() === 3) {
                        if (!quizSelected) {
                            quizSelected = true;
                            app.handleField($quizWrap[0], new EV.QuizSettings(), '#quiz');
                        }
                        $('.action-choose', $quizWrap).click();
                        $embeds.filter('.quiz').show();
                    }
                }
            });
            resize();
        }).fail(function(message) {
            window.alert(message);
        });
    });

}(jQuery));
