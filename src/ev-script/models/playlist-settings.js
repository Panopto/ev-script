define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'playlist',
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
