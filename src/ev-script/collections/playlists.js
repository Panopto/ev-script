define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.filterValue;
            this.pageIndex = 1;
            this.hasMore = true;
        },
        url: function() {
            var api_url = this.config.ensembleUrl + '/api/Playlists';
            var sizeParam = 'PageSize=' + this.config.pageSize;
            var indexParam = 'PageIndex=' + this.pageIndex;
            var onParam = 'FilterOn=LibraryId';
            var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
            var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
            return this.config.urlCallback(url);
        }
    });

});
