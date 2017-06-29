/*global EV,evSettings,jQuery,document,window,_*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp(_.extend(evSettings, {
        hidePickers: false,
        scrollHeight: false,
        fitToParent: true,
        getLocaleCallback: function() { return 'es-MX'; },
        getDateFormatCallback: function() { return 'DD/MM/YYYY'; },
        getTimeFormatCallback: function() { return 'hh:mm A'; },
        relativeI18nPath: '../../src/ev-script/i18n'
    }));

    app.appEvents.bind('fieldUpdated', function($field, value) {
        var $embed = $('.embed');
        if (value) {
            if ($field[0].id === 'video') {
                app.handleEmbed($embed, new EV.VideoSettings(value));
            } else if ($field[0].id === 'playlist') {
                app.handleEmbed($embed, new EV.PlaylistSettings(value));
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
            resize = function(event) {
                $container.height($(window).height() * 0.8);
                $tabs.tabs('refresh');
                app.appEvents.trigger('resize');
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
                    app.appEvents.trigger('resize');
                }
            });
            resize();
        }).fail(function(message) {
            window.alert(message);
        });
    });

}(jQuery));
