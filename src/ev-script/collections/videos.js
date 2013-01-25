/*global define*/
define(function(require) {

  'use strict';

  var BaseCollection = require('ev-script/collections/base');

  return BaseCollection.extend({
      initialize: function(models, options) {
          this.filterOn = options.filterOn;
          this.filterValue = options.filterValue;
          this.sourceUrl = options.sourceUrl;
          this.pageIndex = 1;
          this.hasMore = true;
          this.config = options.config;
      },
      url: function() {
          var api_url = this.config.ensembleUrl + this.sourceUrl;
          var sizeParam = 'PageSize=' + this.config.pageSize;
          var indexParam = 'PageIndex=' + this.pageIndex;
          var onParam = 'FilterOn=' + encodeURIComponent(this.filterOn);
          var valueParam = 'FilterValue=' + encodeURIComponent(this.filterValue);
          var url = api_url + '?' + sizeParam + '&' + indexParam + '&' + onParam + '&' + valueParam;
          return this.config.urlCallback(url);
      }
  });

});