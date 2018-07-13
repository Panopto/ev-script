define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'quiz',
            width: '848',
            height: '480',
            showtitle: false,
            showcaptions: false,
            attachments: false,
            links: false,
            metadata: false,
            // isaudio: false,
            // contenttype: ''
            search: ''
        }
    });
});
