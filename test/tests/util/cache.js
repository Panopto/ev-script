define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache');

    q.module('Testing ev-script/util/cache');

    q.test('check api', 6, function() {
        q.ok(_.isObject(cacheUtil.caches), 'expected caches object');
        q.ok(_.isFunction(cacheUtil.Cache), 'expected Cache function');
        q.ok(_.isFunction(cacheUtil.setAppConfig), 'expected setAppConfig function');
        q.ok(_.isFunction(cacheUtil.getAppConfig), 'expected getAppConfig function');
        q.ok(_.isFunction(cacheUtil.getUserCache), 'expected getUserCache function');
        q.equal(_.size(cacheUtil), 5, 'is something exposed but not tested?');
    });

    q.test('check Cache api', 4, function() {
        var cache = new cacheUtil.Cache();
        q.ok(_.isArray(cache.cache), 'expected cache array');
        q.ok(_.isFunction(cache.get), 'expected get function');
        q.ok(_.isFunction(cache.set), 'expected set function');
        q.equal(_.size(cache), 3, 'is something exposed but not tested?');
    });

    q.test('check caches', 1, function() {
        q.ok(cacheUtil.caches instanceof cacheUtil.Cache, 'expected caches to be instance of Cache');
    });

});
