define(function(require) {

    'use strict';

    var q = QUnit,
        cacheUtil = require('ev-script/util/cache'),
        Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/base');

    q.module('Testing ev-script/collections/base', {
        setup: function() {
            this.appId = Math.random();
            this.config = { foo: 'foo' };
            cacheUtil.setAppConfig(this.appId, this.config);
            this.collection = new BaseCollection([ { ID: 'test' } ], {
                appId: this.appId
            });
        }
    });

    q.test('test parse', 1, function() {
        q.strictEqual(this.collection.parse({
            Data: 'foo'
        }), 'foo', 'expected parse to return Data value');
    });

    q.test('test initialize', 4, function() {
        // Make sure collection has appId and config
        q.strictEqual(this.collection.appId, this.appId);
        // Make sure we're grabbing the appropriate app config
        q.deepEqual(this.collection.config, this.config);
        // Make sure the model id attribute is set to 'ID'
        q.strictEqual(this.collection.at(0).id, 'test');
        q.ok(this.collection.get('test') instanceof Backbone.Model);
    });

});
