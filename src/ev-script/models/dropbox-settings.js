define(['backbone'], function(Backbone) {

    'use strict';

    return Backbone.Model.extend({
        defaults: {
            type: 'dropbox',
            title: '',
            shortName: '',
            search: ''
        }
    });
});
