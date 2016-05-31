define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        sizeUtil = require('ev-script/util/size');

    q.module('Testing ev-script/util/size');

    q.test('check api', 6, function() {
        q.ok(_.isArray(sizeUtil.optionsSixteenByNine), 'expected optionsSixteenByNine array');
        q.ok(_.isArray(sizeUtil.optionsFourByThree), 'expected optionsFourByThree array');
        q.ok(_.isFunction(sizeUtil.ratiosAreRoughlyEqual), 'expected ratiosAreRoughlyEqual function');
        q.ok(_.isFunction(sizeUtil.getAvailableDimensions), 'expected getAvailableDimensions function');
        q.ok(_.isFunction(sizeUtil.findClosestDimension), 'expected findClosestDimension function');
        q.equal(_.size(sizeUtil), 5, 'is something exposed but not tested?');
    });

    q.test('test ratiosAreRoughlyEqual', 5, function() {
        q.ok(sizeUtil.ratiosAreRoughlyEqual(16 / 9, 16 / 9));
        // This is not exactly equal
        q.ok(sizeUtil.ratiosAreRoughlyEqual(848 / 480, 16 / 9));
        q.ok(sizeUtil.ratiosAreRoughlyEqual(4 / 3, 4 / 3));
        // This is not exactly equal
        q.ok(sizeUtil.ratiosAreRoughlyEqual(1024 / 770, 4 / 3));
        // Not roughly equal
        q.ok(!sizeUtil.ratiosAreRoughlyEqual(16 / 9, 4 / 3));
    });

    q.test('test getAvailableDimensions with no ratio', 3, function() {
        var dimensions = sizeUtil.getAvailableDimensions();
        q.ok(_.isArray(dimensions), 'expecting an array');
        q.ok(dimensions.length > 0, 'expecting length > 0');
        var dims = dimensions[0].split('x');
        q.ok(sizeUtil.ratiosAreRoughlyEqual(dims[0] / dims[1], 16 / 9), 'expecting default ratio of 16:9');
    });

    q.test('test getAvailableDimensions with bogus ratio', 3, function() {
        var dimensions = sizeUtil.getAvailableDimensions(100);
        q.ok(_.isArray(dimensions), 'expecting an array');
        q.ok(dimensions.length > 0, 'expecting length > 0');
        var dims = dimensions[0].split('x');
        q.ok(sizeUtil.ratiosAreRoughlyEqual(dims[0] / dims[1], 16 / 9), 'expecting default ratio of 16:9');
    });

    q.test('test getAvailableDimensions with 16:9 ratio', 3, function() {
        var dimensions = sizeUtil.getAvailableDimensions(16 / 9);
        q.ok(_.isArray(dimensions), 'expecting an array');
        q.ok(dimensions.length > 0, 'expecting length > 0');
        var dims = dimensions[0].split('x');
        q.ok(sizeUtil.ratiosAreRoughlyEqual(dims[0] / dims[1], 16 / 9), 'expecting ratio of 16:9');
    });

    q.test('test getAvailableDimensions with 4:3 ratio', 3, function() {
        var dimensions = sizeUtil.getAvailableDimensions(4 / 3);
        q.ok(_.isArray(dimensions), 'expecting an array');
        q.ok(dimensions.length > 0, 'expecting length > 0');
        var dims = dimensions[0].split('x');
        q.ok(sizeUtil.ratiosAreRoughlyEqual(dims[0] / dims[1], 4 / 3), 'expecting ratio of 4:3');
    });

    q.test('test findClosestDimension by 16:9 ratio', 1, function() {
        var dimension = sizeUtil.findClosestDimension(16 / 9, 640);
        q.equal(dimension, '640x360');
    });

    q.test('test findClosestDimension by 4:3 ratio', 1, function() {
        var dimension = sizeUtil.findClosestDimension(4 / 3, 640);
        q.equal(dimension, '640x480');
    });

    q.test('test findClosestDimension by bogus ratio', 1, function() {
        var dimension = sizeUtil.findClosestDimension(100, 640);
        q.equal(dimension, '640x360');
    });

    q.test('test findClosestDimension by array', 1, function() {
        var dimension = sizeUtil.findClosestDimension([ '800x123', '500x123'], 600);
        q.equal(dimension, '500x123');
    });

});
