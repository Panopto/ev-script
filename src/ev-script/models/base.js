define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache'),
        BaseModel;

    BaseModel = Backbone.Model.extend({
        // constructor: function(attributes, options) {
        //     // Parse a copy of the passed in attributes during construction.
        //     Backbone.Model.call(this, this._parse(_.clone(attributes)), options);
        // },
        initialize: function(attributes, options) {
            options = options || {};
            this.href = options.href;
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.promise = $.Deferred().resolve().promise();
        },
        getCached: function(key) {},
        setCached: function(key, value) {},
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
                        return new BaseModel(item, { appId : this.appId });
                    }, this)), { appId : this.appId }) :
                new BaseModel(resource, { appId : this.appId });
        },
        // _parse: function(attributes) {
        //     // Borrowing from https://github.com/mikekelly/backbone.hal
        //     attributes = attributes || {};
        //     this.links = attributes._links || attributes.links || {};
        //     delete attributes._links;
        //     this.embedded = attributes._embedded || attributes.embedded || {};
        //     delete attributes._embedded;
        //     return attributes;
        // },
        // parse: function(response) {
        //     return this._parse(response);
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
                    this.promise = Backbone.Model.prototype.sync.call(this, method, collection, options);
                    return this.promise;
                }
            } else {
                this.promise = Backbone.Model.prototype.sync.call(this, method, collection, options);
                return this.promise;
            }
        },
        url: function() {
            var url = this.href ? this.href : this.getLink('self').href;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        }
    });

    return BaseModel;
});
