define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'video',
            width: '640',
            height: '360',
            showtitle: true,
            autoplay: false,
            showcaptions: false,
            hidecontrols: false,
            socialsharing: false,
            annotations: true,
            captionsearch: true,
            attachments: true,
            audiopreviewimage: false,
            links: true,
            metadata: true,
            dateproduced: true,
            embedcode: false,
            download: false,
            viewersreport: true,
            search: '',
            sourceId: 'content',
            isaudio: false
        }
    });
});
