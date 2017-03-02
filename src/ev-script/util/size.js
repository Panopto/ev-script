define(function(require) {

    'use strict';

    var _ = require('underscore');

    return {
        optionsSixteenByNine: ['1280x720', '1024x576', '848x480', '720x405', '640x360', '610x344', '560x315', '480x270', '400x225', '320x180', '240x135', '160x90'],
        optionsFourByThree: ['1280x960', '1024x770', '848x636', '720x540', '640x480', '610x460', '560x420', '480x360', '400x300', '320x240', '240x180', '160x120'],
        ratiosAreRoughlyEqual: function(ratioA, ratioB) {
            // Use a fuzz factor to determine ratio equality since our sizes are not always accurate
            return Math.ceil(ratioA * 10) / 10 === Math.ceil(ratioB * 10) / 10;
        },
        getAvailableDimensions: function(ratio) {
            ratio = ratio || 16 / 9;
            var options = this.optionsSixteenByNine;
            if (this.ratiosAreRoughlyEqual(ratio, 4 / 3)) {
                options = this.optionsFourByThree;
            }
            return options;
        },
        findClosestDimension: function(arg, desiredWidth) {
            var offset = Number.MAX_VALUE,
                dimensions = _.isNumber(arg) ? this.getAvailableDimensions(arg) : arg,
                closest;
            // Find the first available or closest dimension that matches our desired width
            var match = _.find(dimensions, _.bind(function(dimension) {
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
