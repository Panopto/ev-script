define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.Collection.extend({
        initialize: function(collections, options) {
            this.requiresAuth = true;
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.auth = cacheUtil.getAppAuth(this.appId);
            this.info = cacheUtil.getAppInfo(this.appId);
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
        fetch: function(options) {
            if (options && options.success) {
                options.success = _.wrap(options.success, _.bind(function(success) {
                    // We've successfully queried the API for something that
                    // requires authentication but we're in an unauthenticated
                    // state.  Double-check our authentication and proceed.
                    if (this.requiresAuth && !this.auth.isAuthenticated()) {
                        this.auth.fetchUser()
                        .always(function() {
                            success.apply(this, Array.prototype.slice.call(arguments, 1));
                        });
                    } else {
                        success.apply(this, Array.prototype.slice.call(arguments, 1));
                    }
                }, this));
                // TODO - maybe wrap error to handle 401?
            }
            return Backbone.Collection.prototype.fetch.call(this, options);
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
