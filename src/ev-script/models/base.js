define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache'),
        BaseCollection = require('ev-script/collections/base');

    return Backbone.Model.extend({
        constructor: function(attributes, options) {
            // Parse a copy of the passed in attributes during construction.
            Backbone.Model.call(this, this._parse(_.clone(attributes)), options);
        },
        initialize: function(attributes, options) {
            this.href = options.href;
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
        },
        getCached: function() {},
        setCached: function() {},
        _parse: function(attributes) {
            // Borrowing from https://github.com/mikekelly/backbone.hal
            attributes = attributes || {};
            this.links = attributes._links || attributes.links || {};
            delete attributes._links;
            this.embedded = attributes._embedded || attributes.embedded || {};
            delete attributes._embedded;
            return attributes;
        },
        parse: function(response) {
            return this._parse(response);
        },
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
                    return Backbone.Model.prototype.sync.call(this, method, collection, options);
                }
            } else {
                return Backbone.Model.prototype.sync.call(this, method, collection, options);
            }
        },
        url: function() {
            var url = this.links['self'] ? this.links['self'].href : this.href;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        }
    });

});
