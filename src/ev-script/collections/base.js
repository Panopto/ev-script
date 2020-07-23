define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.Collection.extend({
        initialize: function(collections, options) {
            this.href = options.href;
            this.config = cacheUtil.getConfig();
            this.info = cacheUtil.getInfo();
            this.root = cacheUtil.getRoot();
            this.auth = cacheUtil.getAuth();
            this.promise = $.Deferred().resolve().promise();
        },
        getCached: function(key) {},
        setCached: function(key, resp) {},
        clearCache: function(key) {},
        sync: function(method, collection, options) {
            var deferred = $.Deferred();

            this.promise = deferred.promise();

            this.auth.userManager.getUser()
            .then(_.bind(function(user) {
                _.defaults(options || (options = {}), {
                    headers: {
                        'Authorization': 'Bearer ' + (user ? user.access_token : '')
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
                            options.success.call(this, cached);
                        }
                        deferred.resolve(cached);
                    } else {
                        // Grab the response and cache
                        options.success = options.success || function(collection, response, options) {};
                        options.success = _.wrap(options.success, _.bind(function(success) {
                            this.setCached(options.cacheKey, arguments[1]);
                            success.apply(this, Array.prototype.slice.call(arguments, 1));
                        }, this));
                        Backbone.Collection.prototype.sync.call(this, method, collection, options)
                        .done(function(data, status, xhr) {
                            deferred.resolve(data, status, xhr);
                        })
                        .fail(function(xhr, status, error) {
                            deferred.reject(xhr, status, error);
                        });
                    }
                } else {
                    Backbone.Collection.prototype.sync.call(this, method, collection, options)
                    .done(function(data, status, xhr) {
                        deferred.resolve(data, status, xhr);
                    })
                    .fail(function(xhr, status, error) {
                        deferred.reject(xhr, status, error);
                    });
                }
            }, this));

            return this.promise;
        },
        url: function() {
            return this.href ? this.href : this.links['self'].href;
        },
        trigger: function(name) {
            log.trace('[collections/base] Event triggered: ' + name);
            log.trace(arguments);
            return Backbone.Collection.prototype.trigger.apply(this, arguments);
        }
    });

});
