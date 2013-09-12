define(function(require) {

    'use strict';

    var q = QUnit,
        testUtil = require('test/util'),
        cacheUtil = require('ev-script/util/cache'),
        Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/base');

    q.module('Testing ev-script/collections/base', {
        setup: testUtil.setupHelper('ev-script/collections/base', {
            setupAuth: function() {
                this.collection = new BaseCollection([ { ID: 'test' } ], {
                    appId: this.appId
                });
            },
            authenticate: false
        })
    });

    q.test('test extends Backbone.Collection', 1, function() {
        q.ok(this.collection instanceof Backbone.Collection);
    });

    q.test('test parse', 1, function() {
        q.strictEqual(this.collection.parse({
            Data: 'foo'
        }), 'foo', 'expected parse to return Data value');
    });

    q.test('test initialize', 6, function() {
        q.strictEqual(this.collection.appId, this.appId);
        q.deepEqual(this.collection.config, this.config);
        q.deepEqual(this.collection.info, this.info);
        q.deepEqual(this.collection.auth, this.auth);
        // Make sure the model id attribute is set to 'ID'
        q.strictEqual(this.collection.at(0).id, 'test');
        q.ok(this.collection.get('test') instanceof Backbone.Model);
    });

});
