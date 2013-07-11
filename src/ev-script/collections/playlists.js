define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.filterValue || '';
            this.pageIndex = 1;
        },
        getCached: function(key) {
            var cache = cacheUtil.getUserCache(this.config.ensembleUrl, this.auth.getUserId());
            return cache ? cache.get('playlists').get(key) : null;
        },
        setCached: function(key, resp) {
            var cache = cacheUtil.getUserCache(this.config.ensembleUrl, this.auth.getUserId());
            return cache ? cache.get('playlists').set(key, resp) : null;
        },
        url: function() {
            var api_url = this.config.ensembleUrl + '/api/Playlists';
            var sizeParam = 'PageSize=' + this.config.pageSize;
            var indexParam = 'PageIndex=' + this.pageIndex;
            var onParam = 'FilterOn=LibraryId';
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        }
    });

});
