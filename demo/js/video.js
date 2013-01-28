/*global EV,evSettings,jQuery,document,window*/
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
        var $embed = $('.video-embed');
        if ($field[0].id === 'video') {
            if (value) {
                app.handleEmbed($embed, new EV.VideoSettings(value));
            } else {
                $embed.html('');
            }
        }
    });

    $(document).ready(function() {
        app.handleField($('#video').parent(), new EV.VideoSettings(), '#video');
    });

}(jQuery));
