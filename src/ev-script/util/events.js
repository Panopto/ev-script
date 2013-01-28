/*global define*/
define(function(require) {

    'use strict';

    var events = [],
        _ = require('underscore'),
        Backbone = require('backbone');

    events['global'] = _.extend({}, Backbone.Events);

    return {
        initEvents: function(index) {
            return events[index] = _.extend({}, Backbone.Events);
        },
        getEvents: function(index) {
            var es;
            if (!index) {
                es = events['global'];
            } else {
                es = events[index];
            }
            return es;
        }
    };

});
