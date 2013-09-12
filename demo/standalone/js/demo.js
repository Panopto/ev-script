/*global EV,evSettings,jQuery,document,window*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp(evSettings);

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

    $(document).ready(function() {
        app.done(function() {
            app.handleField($('#videoWrap')[0], new EV.VideoSettings(), '#video');
            app.handleField($('#playlistWrap')[0], new EV.PlaylistSettings(), '#playlist');
        }).fail(function(message) {
            window.alert(message);
        });
    });

}(jQuery));
