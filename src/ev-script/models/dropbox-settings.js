define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'dropbox',
            width: 600,
            height: 800,
            search: ''
        }
    });
});
