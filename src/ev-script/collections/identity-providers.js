define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache'),
        cached = new cacheUtil.Cache();

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.requiresAuth = false;
        },
        getCached: function(key) {
            return cached.get(this.config.ensembleUrl);
        },
        setCached: function(key, resp) {
            return cached.set(this.config.ensembleUrl, resp);
        },
        url: function() {
            var api_url = this.config.ensembleUrl + '/api/IdentityProviders';
            return this.config.urlCallback ? this.config.urlCallback(api_url) : api_url;
        }
    });

});
