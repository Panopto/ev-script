/*global EV,evSettings,jQuery,document,window,_*/
(function($) {

    'use strict';

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
            },
            app = new EV.EnsembleApp({
                ensembleUrl: 'https://cloud.ensemblevideo.com',
                pageSize: 10,
                institutionId: '52AF905C-187A-4405-AB61-0BBEC3E7E62F',
                clientId: 'ev-lti-chooser',
                scrollHeight: 200,
                fitToParent: true,
                i18nPath: '/src/ev-script/i18n',
                imagePath: '/assets/css/images',
                appRoot: '/demo',
                logLevel: 'debug'
            }),
            updateTabI18n = function() {
                var $tabsList = $('.tabsList', $tabs),
                    $videosAnchor = $('.videosTab a', $tabsList),
                    $playlistsAnchor = $('.playlistsTab a', $tabsList),
                    $dropboxesAnchor = $('.dropboxesTab a', $tabsList),
                    $quizzesAnchor = $('.quizzesTab a', $tabsList),
                    i18n = app.getI18n(),
                    videoI18n = i18n.formatMessage('Media'),
                    playlistI18n = i18n.formatMessage('Playlist'),
                    dropboxI18n = i18n.formatMessage('Dropbox'),
                    quizI18n = i18n.formatMessage('Quiz');

                $videosAnchor.text(i18n.formatMessage('Choose {0}', videoI18n));
                $playlistsAnchor.text(i18n.formatMessage('Choose {0}', playlistI18n));
                $dropboxesAnchor.text(i18n.formatMessage('Choose {0}', dropboxI18n));
                $quizzesAnchor.text(i18n.formatMessage('Choose {0}', quizI18n));
            };

        // Sample default overrides
        // EV.DropboxSettings.prototype.defaults.width = '480';
        // EV.DropboxSettings.prototype.defaults.height = '820';
        // EV.DropboxSettings.prototype.defaults.embedtype = 'responsive';
        // EV.PlaylistSettings.prototype.defaults.embedtype = 'responsive';
        // EV.PlaylistSettings.prototype.defaults.forceembedtype = true;

        app.events.on('fieldUpdated', function($field, value) {
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

        app.events.on('localeUpdated', function() {
            updateTabI18n();
        });

        app.events.on('loggedIn fieldInitialized', function() {
            var panelId = $('.tabsList li.ui-state-active').attr('aria-controls'),
                $panel = $('#' + panelId),
                $fieldWrap = $('.ev-field-wrap', $panel);
            $('.action-choose', $fieldWrap).click();
        });

        $(window).resize(resize);

        app.done(function() {
            updateTabI18n();
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
