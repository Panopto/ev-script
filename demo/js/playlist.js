/*global EV,evSettings,jQuery,document*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp({
        authId: evSettings.authId,
        ensembleUrl: evSettings.ensembleUrl,
        pageSize: evSettings.pageSize,
        urlCallback: function(url) {
            return evSettings.proxyPath + '?authId=' + evSettings.authId + '&request=' + encodeURIComponent(url);
        }
    });

    app.appEvents.bind('fieldUpdated', function($field, value) {
        var $embed = $('.playlist-embed');
        if ($field[0].id === 'playlist') {
            if (value) {
                app.handleEmbed($embed, new EV.PlaylistSettings(value));
            } else {
                $embed.html('');
            }
        }
    });

    $(document).ready(function() {
        app.handleField($('#playlist').parent(), new EV.PlaylistSettings(), '#playlist');
    });

}(jQuery));
