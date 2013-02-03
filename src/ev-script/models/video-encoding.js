define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.Model.extend({
        idAttribute: 'videoID',
        initialize: function(attributes, options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
        },
        url: function() {
            return this.config.ensembleUrl + '/app/api/content/show.json/' + this.get('fetchId');
        },
        getDims: function() {
            var dimsStrs = this.get('dimensions').split('x');
            var dims = [];
            dims[0] = parseInt(dimsStrs[0], 10);
            dims[1] = parseInt(dimsStrs[1], 10);
            return dims;
        },
        getRatio: function() {
            var dims = this.getDims();
            return dims[0] / dims[1];
        },
        getWidth: function() {
            return this.getDims()[0];
        },
        getHeight: function() {
            return this.getDims()[1];
        },
        parse: function(response) {
            return response.dataSet.encodings;
        }
    });

});
