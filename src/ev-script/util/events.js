define(function(require) {

    'use strict';

    var events = {},
        _ = require('underscore'),
        log = require('loglevel'),
        Backbone = require('backbone');

    return {
        getEvents: function(index) {
            index = index || 'default';
            if (!events[index]) {
                var newEvents = _.extend({}, Backbone.Events);
                newEvents.trigger = _.wrap(newEvents.trigger, function(trigger) {
                    log.debug('[util/events] Event triggered: ' + arguments[1]);
                    log.debug(arguments);
                    return trigger.apply(this, Array.prototype.slice.call(arguments, 1));
                });
                events[index] = newEvents;
            }
            return events[index];
        }
    };

});
