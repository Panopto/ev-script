define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base'),
        cacheUtil = require('ev-script/util/cache'),
        URI = require('urijs/URI'),
        _ = require('underscore');

    return BaseModel.extend({
        // initialize: function(models, options) {
        //     BaseModel.prototype.initialize.call(this, models, options);
        //     this.libraryId = options.libraryId || '';
        //     this.filterOn = options.filterOn || '';
        //     this.filterValue = options.filterValue || '';
        //     this.sourceUrl = options.sourceId === 'shared' ? '/api/SharedLibrary' : '/api/MediaLibrary';
        //     this.pageIndex = 1;
        // },
        // _cache: function(key, resp) {
        //     var cachedValue = null,
        //         user = this.auth.getUser(),
        //         userCache = user ? cacheUtil.getUserCache(this.config.ensembleUrl, user.id) : null;
        //     if (userCache) {
        //         var videosCache = userCache.get('videos');
        //         if (!videosCache) {
        //             userCache.set('videos', videosCache = new cacheUtil.Cache());
        //         }
        //         cachedValue = videosCache[resp ? 'set' : 'get'](key, resp);
        //     }
        //     return cachedValue;
        // },
        // getCached: function(key) {
        //     return this._cache(key);
        // },
        // setCached: function(key, resp) {
        //     return this._cache(key, resp);
        // },
        // clearCache: function() {
        //     var user = this.auth.getUser(),
        //         userCache = user ? cacheUtil.getUserCache(this.config.ensembleUrl, user.id) : null;
        //     if (userCache) {
        //         userCache.set('videos', null);
        //     }
        // },
        // url: function() {
        //     var url = URI(this.config.ensembleUrl + this.sourceUrl + '/' + this.libraryId);
        //     url.addQuery({
        //         'PageSize': this.config.pageSize,
        //         'PageIndex': this.pageIndex,
        //         'FilterOn': this.filterOn,
        //         'FilterValue': this.filterValue
        //     });
        //     return this.config.urlCallback ? this.config.urlCallback(url) : url;
        // },
        // parse: function(response) {
        //     var videos = response.Data,
        //         ensembleUrl = this.config.ensembleUrl;
        //     _.each(videos, function(video) {
        //         video.Description = _.unescape(video.Description);
        //         video.Keywords = _.unescape(video.Keywords);
        //         if (new RegExp('^' + ensembleUrl, 'i').test(video.ThumbnailUrl)) {
        //             video.ThumbnailUrl = URI(video.ThumbnailUrl).setQuery({
        //                 Width: 200,
        //                 Height: 112
        //             }).toString();
        //         }
        //     });
        //     return videos;
        // }
    });

});
