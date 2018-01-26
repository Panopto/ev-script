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
            audiopreviewimage: true,
            links: true,
            metadata: true,
            dateproduced: true,
            embedcode: false,
            download: false,
            viewersreport: true,
            embedthumbnail: false,
            search: '',
            sourceId: 'content',
            isaudio: false,
            contenttype: ''
        }
    });
});
