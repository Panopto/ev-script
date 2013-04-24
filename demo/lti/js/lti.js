/*global EV,evSettings,_,jQuery,document,window*/
(function($) {

    'use strict';

    var app = new EV.EnsembleApp(_.extend({}, evSettings, {
            scrollHeight: 300,
            hidePickers: false
        })),
        $tabs = $('#tabs'),
        $videoWrap = $('#videoWrap'),
        $video = $('#video', $videoWrap),
        $videoSubmit = $('.submit', $videoWrap),
        $playlistWrap = $('#playlistWrap'),
        $playlist = $('#playlist', $playlistWrap),
        $playlistSubmit = $('.submit', $playlistWrap),
        // Flag to determine if playlist tab has been selected
        playlistSelected = false,
        submitHandler = function(e) {
            var url = '',
                width = '',
                height = '',
                returnUrl = $.url().param('return_url');
            if (e.data.type === 'video') {
                var videoSettings = new EV.VideoSettings(JSON.parse($video.val()));
                width = (videoSettings.get('width') ? videoSettings.get('width') : '640');
                height = (videoSettings.get('height') ? videoSettings.get('height') : '360');
                url = evSettings.ensembleUrl + '/app/plugin/embed.aspx?ID=' + videoSettings.get('id') + '&autoPlay=' + videoSettings.get('autoplay') + '&displayTitle=' + videoSettings.get('showtitle') + '&hideControls=' + videoSettings.get('hidecontrols') + '&showCaptions=' + videoSettings.get('showcaptions') + '&width=' + width + '&height=' + height;
                // Tweak height to be used below for iframe...has to be done
                // after it is used in url above
                height = (parseInt(height, 10) + 56) + '';
            } else if (e.data.type === 'playlist') {
                var playlistSettings = new EV.PlaylistSettings(JSON.parse($playlist.val()));
                width = '800';
                height = '850';
                url = evSettings.ensembleUrl + '/app/plugin/embed.aspx?DestinationID=' + playlistSettings.get('id');
            }
            e.preventDefault();
            window.location = returnUrl + '?return_type=iframe&url=' + encodeURIComponent(url) + '&width=' + width + '&height=' + height;
        };

    $videoSubmit.click({ type: 'video' }, submitHandler);
    $playlistSubmit.click({ type: 'playlist' }, submitHandler);

    app.appEvents.on('fieldUpdated', function($field, value) {
        if (value) {
            if ($field.attr('id') === 'video') {
                $videoSubmit.show();
            } else if ($field.attr('id') === 'playlist') {
                $playlistSubmit.show();
            }
        } else {
            if ($field.attr('id') === 'video') {
                $videoSubmit.hide();
            } else if ($field.attr('id') === 'playlist') {
                $playlistSubmit.hide();
            }
        }
    });

    // Default tab is videos so go ahead and initialize video content
    app.handleField($videoWrap[0], new EV.VideoSettings(), '#video');
    app.appEvents.trigger('showPicker', 'videoWrap');

    $tabs.tabs({
        heightStyle: 'auto',
        create: function(e, ui) {
            // Don't show tabs until created to avoid unformatted content flash
            $tabs.show();
        },
        show: function(e, ui) {
            // Initialize playlist content once (and only once) the playlist tab is selected
            if (!playlistSelected && ui.index === 1) {
                playlistSelected = true;
                app.handleField($playlistWrap[0], new EV.PlaylistSettings(), '#playlist');
                app.appEvents.trigger('showPicker', 'playlistWrap');
            }
        }
    });

}(jQuery));
