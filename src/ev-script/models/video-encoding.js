define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        BaseModel = require('ev-script/models/base'),
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache');

    return BaseModel.extend({
        idAttribute: 'videoID',
        initialize: function(attributes, options) {
            BaseModel.prototype.initialize.call(this, attributes, options);
            this.requiresAuth = false;
        },
        // TODO - cache responses
        getCached: function(key) {},
        setCached: function(key, resp) {},
        url: function() {
            // Note the response is actually JSONP.  We'll strip the padding
            // below with our dataFilter.
            var url = this.config.ensembleUrl + '/app/api/content/show.json/' + this.get('fetchId');
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        },
        getDims: function() {
            var dimsRaw = this.get('dimensions') || "640x360",
                dimsStrs = dimsRaw.split('x'),
                dims = [];
            dims[0] = parseInt(dimsStrs[0], 10) || 640;
            dims[1] = parseInt(dimsStrs[1], 10) || 360;
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
            if (_.isArray(response.dataSet.encodings)) {
                // This is a collection, so return the highest bitrate encoding
                return _.max(response.dataSet.encodings, function(encoding, index, encodings) {
                    return parseInt(encoding.bitRate, 10);
                });
            } else {
                return response.dataSet.encodings;
            }
        },
        sync: function(method, model, options) {
            _.extend(options, {
                dataFilter: function(data) {
                    // Strip padding from JSONP response
                    var match = data.match(/\{[\s\S]*\}/);
                    return match ? match[0] : data;
                }
            });
            return Backbone.sync.call(this, method, model, options);
        }
    });

});
