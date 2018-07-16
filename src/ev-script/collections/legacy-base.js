define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.Collection.extend({
        initialize: function(collections, options) {
            this.config = cacheUtil.getConfig();
            this.info = cacheUtil.getInfo();
            this.root = cacheUtil.getRoot();
            this.promise = $.Deferred().resolve().promise();
        },
        model: Backbone.Model.extend({
            idAttribute: 'ID'
        }),
        getCached: function(key) {},
        setCached: function(key, resp) {},
        clearCache: function(key) {},
        parse: function(response) {
            return response.Data;
        },
        sync: function(method, collection, options) {
            _.defaults(options || (options = {}), {
                xhrFields: { withCredentials: true }
            });
            if (method === 'read') {
                var cached = this.getCached(options.cacheKey);
                if (cached) {
                    var deferred = $.Deferred();
                    if (options.success) {
                        deferred.done(options.success);
                    }
                    return deferred.resolve(cached).promise();
                } else {
                    // Grab the response and cache
                    options.success = options.success || function(collection, response, options) {};
                    options.success = _.wrap(options.success, _.bind(function(success) {
                        this.setCached(options.cacheKey, arguments[1]);
                        success.apply(this, Array.prototype.slice.call(arguments, 1));
                    }, this));
                    return Backbone.Collection.prototype.sync.call(this, method, collection, options);
                }
            } else {
                return Backbone.Collection.prototype.sync.call(this, method, collection, options);
            }
        }
    });

});
