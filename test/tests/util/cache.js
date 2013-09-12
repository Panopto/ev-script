define(function(require) {

    'use strict';

    var q = QUnit,
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache');

    q.module('Testing ev-script/util/cache');

    q.test('check api', 10, function() {
        q.ok(_.isObject(cacheUtil.caches), 'expected caches object');
        q.ok(_.isFunction(cacheUtil.Cache), 'expected Cache function');
        q.ok(_.isFunction(cacheUtil.setAppConfig), 'expected setAppConfig function');
        q.ok(_.isFunction(cacheUtil.getAppConfig), 'expected getAppConfig function');
        q.ok(_.isFunction(cacheUtil.setAppAuth), 'expected setAppAuth function');
        q.ok(_.isFunction(cacheUtil.getAppAuth), 'expected getAppAuth function');
        q.ok(_.isFunction(cacheUtil.setAppInfo), 'expected setAppInfo function');
        q.ok(_.isFunction(cacheUtil.getAppInfo), 'expected getAppInfo function');
        q.ok(_.isFunction(cacheUtil.getUserCache), 'expected getUserCache function');
        q.equal(_.size(cacheUtil), 9, 'is something exposed but not tested?');
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

    q.test('test Cache instance', 7, function() {
        var cache = new cacheUtil.Cache();
        q.ok(!cache.get('foo'));
        q.strictEqual(cache.set('foo', 'foo'), 'foo');
        q.strictEqual(cache.get('foo'), 'foo');
        q.strictEqual(cache.set('foo', 'bar'), 'bar');
        q.strictEqual(cache.get('foo'), 'bar');
        q.strictEqual(cache.set('baz', 'baz'), 'baz');
        q.notStrictEqual(cache.get('foo'), cache.get('baz'));
    });

    var testHelper = function(key, methodName) {
        var app1 = Math.random(),
            app2 = Math.random(),
            config1 = {
                foo: 'foo'
            },
            config2 = {
                bar: 'bar'
            };
        q.deepEqual(cacheUtil['set' + methodName](app1, config1), config1);
        q.deepEqual(cacheUtil['get' + methodName](app1), config1);
        // Make sure config returned by convenience method is same as that returned by direct access
        q.deepEqual(cacheUtil.caches.get(app1).get(key), config1);
        q.deepEqual(cacheUtil['set' + methodName](app2, config2), config2);
        q.deepEqual(cacheUtil['get' + methodName](app2), config2);
        q.notDeepEqual(cacheUtil['get' + methodName](app1), cacheUtil['get' + methodName](app2));
    };

    q.test('test setAppConfig/getAppConfig', 6, function() {
        testHelper('config', 'AppConfig');
    });

    // Should work the exact same as above
    q.test('test setAppAuth/getAppAuth', 6, function() {
        testHelper('auth', 'AppAuth');
    });

    q.test('test getUserCache', 3, function() {
        var url1 = 'test1',
            url2 = 'test2',
            user = 'user',
            obj1 = {
                thing1: 'thing1'
            },
            obj2 = {
                thing2: 'thing2'
            };
        var url1Cache = cacheUtil.getUserCache(url1, user);
        url1Cache.set('foo', obj1);
        var url2Cache = cacheUtil.getUserCache(url2, user);
        url2Cache.set('foo', obj2);
        // Make sure user caches are different across EV instances
        q.notDeepEqual(cacheUtil.getUserCache(url1, user).get('foo'), cacheUtil.getUserCache(url2, user).get('foo'));
        // Make sure app caches accessed directly match values returned by convenience method
        q.deepEqual(cacheUtil.caches.get(url1).get(user).get('foo'), cacheUtil.getUserCache(url1, user).get('foo'));
        q.deepEqual(cacheUtil.caches.get(url2).get(user).get('foo'), cacheUtil.getUserCache(url2, user).get('foo'));
    });

    q.test('test tracks modifications', 1, function() {
        var obj = {
            foo: 'foo'
        };
        var cache = new cacheUtil.Cache();
        cache.set('test', obj);
        obj.bar = 'bar';
        q.deepEqual(obj, cache.get('test'));
    });
});
