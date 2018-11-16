define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache'),
        BaseModel;

    BaseModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            options = options || {};
            this.href = options.href;
            this.config = cacheUtil.getConfig();
            this.promise = $.Deferred().resolve().promise();

            // While getCache will return a default cache if cacheName is not
            // passed, we want to allow opt-out. So if cacheName is not set
            // simply use a null cache.
            this.cache = this.cacheName ? cacheUtil.getCache(this.cacheName) : null;
        },
        getCached: function(key) {
            return this.cache && this.cache.get(key);
        },
        setCached: function(key, resp) {
            return this.cache && this.cache.set(key, resp);
        },
        getLink: function(rel) {
            var links = this.get('_links');
            return links ? links[rel] : null;
        },
        getEmbedded: function(rel) {
            var embedded = this.get('_embedded');
            if (!embedded) {
                return null;
            }
            var resource = embedded[rel];
            if (!resource) {
                return null;
            }
            return _.isArray(resource) ?
                new BaseCollection(_.map(resource, _.bind(function(item) {
                        return new BaseModel(item, {});
                    }, this)), {}) :
                new BaseModel(resource, {});
        },
        sync: function(method, collection, options) {
            _.defaults(options || (options = {}), {
                xhrFields: {
                    withCredentials: true
                },
                dataType: 'json',
                accepts: {
                    json: 'application/hal+json'
                },
                cache: false
            });
            if (method === 'read') {
                var url = this.url(),
                    cached = this.getCached(url);
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
                        this.setCached(url, arguments[1]);
                        success.apply(this, Array.prototype.slice.call(arguments, 1));
                    }, this));
                    this.promise = Backbone.Model.prototype.sync.call(this, method, collection, options);
                    return this.promise;
                }
            } else {
                this.promise = Backbone.Model.prototype.sync.call(this, method, collection, options);
                return this.promise;
            }
        },
        url: function() {
            return this.href ? this.href : this.getLink('self').href;
        }
    });

    return BaseModel;
});
