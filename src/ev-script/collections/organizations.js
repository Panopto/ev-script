define(function(require) {

    'use strict';

    var BaseCollection = require('ev-script/collections/base');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
        },
        url: function() {
            var api_url = this.config.ensembleUrl + '/api/Organizations';
            // Make this arbitrarily large so we can retrieve ALL orgs in a single request
            var sizeParam = 'PageSize=9999';
            var indexParam = 'PageIndex=1';
            var url = api_url + '?' + sizeParam + '&' + indexParam;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        }
    });

});
