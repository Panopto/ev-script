define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'video',
            showtitle: false,
            autoplay: false,
            showcaptions: false,
            hidecontrols: false,
            search: '',
            sourceId: 'content'
        }
    });
});
