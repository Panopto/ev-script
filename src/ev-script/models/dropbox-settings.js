define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'dropbox',
            width: '848',
            height: '495',
            search: ''
        }
    });
});
