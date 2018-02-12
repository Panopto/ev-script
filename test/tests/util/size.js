define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        sizeUtil = require('ev-script/util/size');

    q.module('Testing ev-script/util/size');

    q.test('check api', 4, function() {
        q.ok(_.isArray(sizeUtil.optionsSixteenByNine), 'expected optionsSixteenByNine array');
        q.ok(_.isFunction(sizeUtil.getAvailableDimensions), 'expected getAvailableDimensions function');
        q.ok(_.isFunction(sizeUtil.findClosestDimension), 'expected findClosestDimension function');
        q.equal(_.size(sizeUtil), 3, 'is something exposed but not tested?');
    });

    q.test('test findClosestDimension', 1, function() {
        var dimension = sizeUtil.findClosestDimension(640);
        q.equal(dimension, '640x360');
    });

});
