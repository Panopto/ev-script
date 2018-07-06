define(function(require) {

    'use strict';

    var events = {},
        _ = require('underscore'),
        Backbone = require('backbone');

    return {
        getEvents: function(index) {
            index = index || 'default';
            if (!events[index]) {
                events[index] = _.extend({}, Backbone.Events);
            }
            return events[index];
        }
    };

});
