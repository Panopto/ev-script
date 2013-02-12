define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.filterValue = options.organizationId || '';
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
