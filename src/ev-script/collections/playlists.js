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

            // This needs to go to base (but will already be once moved from collection to model as w/ hapi responses)
            this.on('loggedOut', this.clearCache);
            this.on('reloadPlaylists', this.clearCache);
        },
        _cache: function(key, resp) {
            return cacheUtil.getCache('playlists')[resp ? 'set' : 'get'](key, resp);
        },
        getCached: function(key) {
            return this._cache(key);
        },
        setCached: function(key, resp) {
            return this._cache(key, resp);
        },
        clearCache: function() {
            cacheUtil.getCache('playlists').clear();
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
