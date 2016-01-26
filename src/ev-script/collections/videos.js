define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.libraryId = options.libraryId || '';
            this.filterOn = options.filterOn || '';
            this.filterValue = options.filterValue || '';
            if (this.info.checkVersion('>=4.1.0')) {
                this.sourceUrl = options.sourceId === 'shared' ? '/api/SharedLibrary' : '/api/MediaLibrary';
            } else {
                this.sourceUrl = options.sourceId === 'shared' ? '/api/SharedContent' : '/api/Content';
            }
            this.pageIndex = 1;
        },
        _cache: function(key, resp) {
            var cachedValue = null,
                user = this.auth.getUser(),
                userCache = user ? cacheUtil.getUserCache(this.config.ensembleUrl, user.id) : null;
            if (userCache) {
                var videosCache = userCache.get('videos');
                if (!videosCache) {
                    userCache.set('videos', videosCache = new cacheUtil.Cache());
                }
                cachedValue = videosCache[resp ? 'set' : 'get'](key, resp);
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
                userCache.set('videos', null);
            }
        },
        url: function() {
            var api_url = this.config.ensembleUrl + this.sourceUrl,
                sizeParam = 'PageSize=' + this.config.pageSize,
                indexParam = 'PageIndex=' + this.pageIndex,
                onParam = 'FilterOn=' + encodeURIComponent(this.filterOn),
                valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue),
                url = api_url + '/' + this.libraryId + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        }
    });

});
