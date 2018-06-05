define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.organizationId || '';
            this.itemRel = 'libraries';
        },
        _cache: function(key, resp) {
            var cachedValue = null,
                user = this.auth.getUser(),
                userCache = user ? cacheUtil.getUserCache(this.config.ensembleUrl, user.id) : null;
            if (userCache) {
                var libsCache = userCache.get('libs');
                if (!libsCache) {
                    userCache.set('libs', libsCache = new cacheUtil.Cache());
                }
                cachedValue = libsCache[resp ? 'set' : 'get'](key, resp);
            }
            return cachedValue;
        },
        getCached: function(key) {
            return this._cache(key);
        },
        setCached: function(key, resp) {
            return this._cache(key, resp);
        },
        // url: function() {
        //     var api_url = this.config.ensembleUrl + '/api/Libraries';
        //     // Make this arbitrarily large so we can retrieve ALL libraries under an org in a single request
        //     var sizeParam = 'PageSize=9999';
        //     var indexParam = 'PageIndex=1';
        //     var onParam = 'FilterOn=OrganizationId';
        //     var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
        //     var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
        //     return this.config.urlCallback ? this.config.urlCallback(url) : url;
        // }
    });

});
