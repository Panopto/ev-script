/*global EV,evSettings,jQuery,document,window*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp({
        authId: evSettings.authId,
        authPath: evSettings.authPath,
        ensembleUrl: evSettings.ensembleUrl,
        pageSize: evSettings.pageSize,
        urlCallback: function(url) {
            return evSettings.proxyPath + '?authId=' + evSettings.authId + '&request=' + encodeURIComponent(url);
        }
    });

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
        app.handleField($('#video').parent(), new EV.VideoSettings(), '#video');
        app.handleField($('#playlist').parent(), new EV.PlaylistSettings(), '#playlist');
    });

}(jQuery));
