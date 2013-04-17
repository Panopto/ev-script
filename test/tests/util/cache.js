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

    q.test('test setAppConfig/getAppConfig', 6, function() {
        var app1 = Math.random(),
            app2 = Math.random(),
            config1 = {
                foo: 'foo'
            },
            config2 = {
                bar: 'bar'
            };
        q.deepEqual(cacheUtil.setAppConfig(app1, config1), config1);
        q.deepEqual(cacheUtil.getAppConfig(app1), config1);
        // Make sure config returned by convenience method is same as that returned by direct access
        q.deepEqual(cacheUtil.caches.get(app1).get('config'), config1);
        q.deepEqual(cacheUtil.setAppConfig(app2, config2), config2);
        q.deepEqual(cacheUtil.getAppConfig(app2), config2);
        q.notDeepEqual(cacheUtil.getAppConfig(app1), cacheUtil.getAppConfig(app2));
    });

    q.test('test getUserCache', 7, function() {
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
        // Make sure cache hs expected structure
        q.ok(url1Cache.get('videos') instanceof cacheUtil.Cache);
        q.ok(url1Cache.get('playlists') instanceof cacheUtil.Cache);
        q.strictEqual(url1Cache.get('orgs'), null);
        q.ok(url1Cache.get('libs') instanceof cacheUtil.Cache);
        url1Cache.get('videos').set('foo', obj1);
        var url2Cache = cacheUtil.getUserCache(url2, user);
        url2Cache.get('videos').set('foo', obj2);
        // Make sure user caches are different across EV instances
        q.notDeepEqual(cacheUtil.getUserCache(url1, user).get('videos').get('foo'), cacheUtil.getUserCache(url2, user).get('videos').get('foo'));
        // Make sure app caches accessed directly match values returned by convenience method
        q.deepEqual(cacheUtil.caches.get(url1).get(user).get('videos').get('foo'), cacheUtil.getUserCache(url1, user).get('videos').get('foo'));
        q.deepEqual(cacheUtil.caches.get(url2).get(user).get('videos').get('foo'), cacheUtil.getUserCache(url2, user).get('videos').get('foo'));
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
