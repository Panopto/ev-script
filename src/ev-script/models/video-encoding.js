define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.Model.extend({
        idAttribute: 'videoID',
        initialize: function(attributes, options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
        },
        url: function() {
            // Note we're not doing a JSONP request but we're using the JSONP
            // response because it's the closest to valid JSON the API will
            // provide.  We'll strip the padding below with our dataFilter.
            var url = this.config.ensembleUrl + '/app/simpleapi/video/show.jsonp/' + this.get('fetchId');
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        },
        getDims: function() {
            var dimsRaw = this.get('dimensions') || "640x360",
                dimsStrs = dimsRaw.split('x'),
                dims = [];
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
            if (_.isArray(response.videos.videoEncodings)) {
                // This is a collection, so return the highest bitrate encoding
                return _.max(response.videos.videoEncodings, function(encoding, index, encodings) {
                    return parseInt(encoding.bitrate, 10);
                });
            } else {
                return response.videos.videoEncodings;
            }
        },
        sync: function(method, model, options) {
            _.extend(options, {
                dataFilter: function(data) {
                    // Strip padding from JSONP response
                    var match = data.match(/\{[\s\S]*\}/);
                    return match[0];
                }
            });
            return Backbone.sync.call(this, method, model, options);
        }
    });

});
