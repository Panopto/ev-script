define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base'),
        URI = require('urijs/URI'),
        cacheUtil = require('ev-script/util/cache');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.libraryId = options.libraryId || '';
            this.filterValue = options.filterValue || '';
            this.pageIndex = 1;
        },
        _cache: function(key, resp) {
            var cachedValue = null,
                user = this.auth.getUser(),
                userCache = user ? cacheUtil.getUserCache(this.config.ensembleUrl, user.id) : null;
            if (userCache) {
                var playlistsCache = userCache.get('playlists');
                if (!playlistsCache) {
                    userCache.set('playlists', playlistsCache = new cacheUtil.Cache());
                }
                cachedValue = playlistsCache[resp ? 'set' : 'get'](key, resp);
            }
            return cachedValue;
        },
        getCached: function(key) {
            return this._cache(key);
        },
        setCached: function(key, resp) {
            return this._cache(key, resp);
        },
        clearCache: function() {
            var user = this.auth.getUser(),
                userCache = user ? cacheUtil.getUserCache(this.config.ensembleUrl, user.id) : null;
            if (userCache) {
                userCache.set('playlists', null);
            }
        },
        url: function() {
            var api_url = URI(this.config.ensembleUrl + '/api/Playlists/');
            api_url.filename(this.libraryId);
            api_url.addQuery({
                'PageSize': this.config.pageSize,
                'PageIndex': this.pageIndex
            });
            if (this.filterValue) {
                api_url.addQuery({
                    'FilterOn': 'Name',
                    'FilterValue': this.filterValue
                });
            }
            return this.config.urlCallback ? this.config.urlCallback(api_url) : api_url;
        }
    });

});
