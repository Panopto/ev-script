define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        URI = require('urijs/URI'),
        Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache'),
        BaseModel;

    BaseModel = Backbone.Model.extend({
        initialize: function(attributes, options) {
            options = options || {};
            this.href = options.href;
            this.config = cacheUtil.getConfig();
            this.auth = cacheUtil.getAuth();
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
                    },
                    cache: false
                });
                if (method === 'read') {
                    var key = URI(this.url()).removeQuery('_'), // Remove cache busting parameter
                        cached = this.getCached(key);
                    if (cached) {
                        if (options.success) {
                            deferred.done(options.success);
                        }
                        deferred.resolve(cached);
                    } else {
                        // Grab the response and cache
                        options.success = options.success || function(collection, response, options) {};
                        options.success = _.wrap(options.success, _.bind(function(success) {
                            this.setCached(key, arguments[1]);
                            success.apply(this, Array.prototype.slice.call(arguments, 1));
                        }, this));
                        Backbone.Model.prototype.sync.call(this, method, collection, options)
                        .done(function(data, status, xhr) {
                            deferred.resolve(data, status, xhr);
                        })
                        .fail(function(xhr, status, error) {
                            deferred.reject(xhr, status, error);
                        });
                    }
                } else {
                    Backbone.Model.prototype.sync.call(this, method, collection, options)
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
            return this.href ? this.href : this.getLink('self').href;
        },
        trigger: function(name) {
            log.trace('[models/base] Event triggered: ' + name);
            log.trace({
                this: this,
                arguments: arguments
            });
            return Backbone.Model.prototype.trigger.apply(this, arguments);
        },
        fetch: function() {
            log.debug('[models/base] fetch');
            log.debug({
                this: this,
                arguments: arguments
            });
            return Backbone.Model.prototype.fetch.apply(this, arguments);
        }
    });

    return BaseModel;
});
