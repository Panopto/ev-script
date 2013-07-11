define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.organizationId || '';
        },
        getCached: function(key) {
            var cache = cacheUtil.getUserCache(this.config.ensembleUrl, this.auth.getUserId());
            return cache ? cache.get('libs').get(key) : null;
        },
        setCached: function(key, resp) {
            var cache = cacheUtil.getUserCache(this.config.ensembleUrl, this.auth.getUserId());
            return cache ? cache.get('libs').set(key, resp) : null;
        },
        url: function() {
            var api_url = this.config.ensembleUrl + '/api/Libraries';
            // Make this arbitrarily large so we can retrieve ALL libraries under an org in a single request
            var sizeParam = 'PageSize=9999';
            var indexParam = 'PageIndex=1';
            var onParam = 'FilterOn=OrganizationId';
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        }
    });

});
