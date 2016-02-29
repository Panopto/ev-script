define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'video',
            showtitle: true,
            autoplay: false,
            showcaptions: false,
            hidecontrols: false,
            socialsharing: false,
            annotations: true,
            captionsearch: true,
            attachments: true,
            links: true,
            metadata: true,
            dateproduced: true,
            embedcode: false,
            download: false,
            search: '',
            sourceId: 'content'
        }
    });
});
