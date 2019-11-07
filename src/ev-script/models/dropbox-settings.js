define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'dropbox',
            width: '848',
            height: '620',
            search: ''
        }
    });
});
