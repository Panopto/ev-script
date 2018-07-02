define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        // BaseModel = require('ev-script/models/base'),
        cacheUtil = require('ev-script/util/cache');

    // TODO - as part of switch to hapi, most (all) current collections will
    // actually become models.  These models may contain a collection for
    // embedded resources, but not sure yet.

    return Backbone.Collection.extend({
        // constructor: function(obj, options) {
        //     if (!_.isArray(obj)) {
        //         obj = this._parse(_.clone(obj));
        //     }
        //     // Parse a copy of the passed in attributes during construction.
        //     Backbone.Collection.call(this, obj, options);
        // },
        initialize: function(collections, options) {
            this.href = options.href;
            this.config = cacheUtil.getConfig();
            this.auth = cacheUtil.getAuth();
            this.info = cacheUtil.getInfo();
            this.promise = $.Deferred().resolve().promise();
        },
        // model: Backbone.Model.extend({
        //     idAttribute: 'id'
        // }),
        getCached: function(key) {},
        setCached: function(key, resp) {},
        clearCache: function(key) {},
        // _parse: function(obj) {
        //     // Borrowing from https://github.com/mikekelly/backbone.hal
        //     var items;
        //     obj = obj || {};
        //     this.links = obj._links || obj.links || {};
        //     delete obj._links;
        //     this.embedded = obj._embedded || obj.embedded || {};
        //     delete obj._embedded;
        //     this.attributes = obj || {};
        //     if (this.itemRel != null) {
        //       items = this.embedded[this.itemRel];
        //     } else {
        //       items = this.embedded.items;
        //     }
        //     _.each(items, _.bind(function(item, index) {
        //         if (!this._isModel(item)) {
        //             items[index] = new BaseModel(item, {});
        //         }
        //     }, this));
        //     return items;
        // },
        // parse: function(response) {
        //     return this._parse(response);
        // },
        // reset: function(obj, options) {
        //     options = options || {};
        //     if (!_.isArray(obj)) {
        //       obj = this.parse(_.clone(obj));
        //     }
        //     options.parse = false;
        //     Backbone.Collection.prototype.reset.call(this, obj, options);
        // },
        sync: function(method, collection, options) {
            _.defaults(options || (options = {}), {
                xhrFields: {
                    withCredentials: true
                },
                dataType: 'json',
                accepts: {
                    json: 'application/hal+json'
                }
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
                    this.promise = Backbone.Collection.prototype.sync.call(this, method, collection, options);
                    return this.promise;
                }
            } else {
                this.promise = Backbone.Collection.prototype.sync.call(this, method, collection, options);
                return this.promise;
            }
        },
        url: function() {
            return this.href ? this.href : this.links['self'].href;
        }
    });

});
