define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'playlist',
            width: '800',
            height: '1000',
            layout: 'playlist',
            playlistLayout: {
                playlistSortBy: 'videoDate',
                playlistSortDirection: 'desc'
            },
            showcaseLayout: {
                // featuredContent: true,
                categoryList: true,
                categoryOrientation: 'horizontal'
            },
            embedcode: false,
            statistics: true,
            duration: true,
            attachments: true,
            annotations: true,
            links: true,
            credits: true,
            socialsharing: false,
            autoplay: false,
            showcaptions: false,
            dateproduced: true,
            audiopreviewimage: false,
            captionsearch: true,
            search: ''
        }
    });
});
