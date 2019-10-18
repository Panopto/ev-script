define(function(require) {

    'use strict';

    var _ = require('underscore');

    return {
        optionsSixteenByNine: ['1280x720', '1024x576', '848x480', '720x405', '640x360', '610x344', '560x315', '480x270', '400x225', '320x180', '240x135', '160x90'],
        // optionsDropbox: ['1280x750', '1024x600', '848x495', '720x420', '640x374', '610x356', '560x330', '480x280', '400x234', '320x190', '240x140', '160x94'],
        optionsDropbox: ['1280x550', '1024x550', '848x550', '720x750', '640x750', '610x750', '560x750', '480x750', '400x750'],//, '320x190', '240x140', '160x94'],
        getAvailableDimensions: function(type) {
            return type && type === 'dropbox' ?
                this.optionsDropbox :
                this.optionsSixteenByNine;
        },
        findClosestDimension: function(desiredWidth, type) {
            var offset = Number.MAX_VALUE,
                closest;
            // Find the first available or closest dimension that matches our desired width
            var match = _.find(this.getAvailableDimensions(type), _.bind(function(dimension) {
                var width = parseInt(dimension.split('x')[0], 10),
                    currentOffset = Math.abs(width - desiredWidth);
                if (currentOffset < offset) {
                    offset = currentOffset;
                    closest = dimension;
                }
                return currentOffset === 0;
            }, this));
            return match || closest;
        }
    };

});
