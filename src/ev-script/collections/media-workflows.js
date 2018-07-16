define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/legacy-base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.libraryId || '';
        },
        _cache: function(key, resp) {
            return cacheUtil.getCache('workflows')[resp ? 'set' : 'get'](key, resp);
        },
        getCached: function(key) {
            return this._cache(key);
        },
        setCached: function(key, resp) {
            return this._cache(key, resp);
        },
        url: function() {
            var api_url = this.config.ensembleUrl + '/api/MediaWorkflows';
            // Make this arbitrarily large so we can retrieve ALL workflows in a single request
            var sizeParam = 'PageSize=9999';
            var indexParam = 'PageIndex=1';
            var onParam = 'FilterOn=LibraryId';
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        },
        // Override base parse in order to grab settings
        parse: function(response) {
            this.settings = response.Settings;
            return response.Data;
        }
    });

});
