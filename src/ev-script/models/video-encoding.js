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
        getDims: function(original) {
            var dimsRaw = this.get('dimensions') || '848x480',
                dimsStrs = dimsRaw.split('x'),
                dims = [],
                originalWidth = parseInt(dimsStrs[0], 10) || 848,
                originalHeight = parseInt(dimsStrs[1], 10) || 480;
            if (this.isAudio()) {
                dims[0] = 400;
                dims[1] = 26;
            } else if (!original && this.config.defaultVideoWidth && this.config.defaultVideoWidth <= originalWidth) {
                dims[0] = parseInt(this.config.defaultVideoWidth, 10) || 848;
                dims[1] = Math.ceil(dims[0] / (originalWidth / originalHeight));
            } else {
                dims[0] = originalWidth;
                dims[1] = originalHeight;
            }
            return dims;
        },
        getWidth: function(original) {
            return this.getDims(original)[0];
        },
        getHeight: function(original) {
            return this.getDims(original)[1];
        },
        isAudio: function() {
            return (/^audio\//i).test(this.get('contentType') || '');
        },
        isGallery: function() {
            // TODO - Gallery has no encodings, thus no attributes and
            // contentType is not set. Need a more reliable approach here though.
            return !this.get('contentType');
        },
        isYouTube: function() {
            return (/^audioVideo\/YouTube/i).test(this.get('contentType') || '');
        },
        isExternal: function() {
            return (/^external\//i).test(this.get('contentType') || '');
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
        },
        updateSettingsModel: function(settingsModel) {
            var attrs = {
                width: this.getWidth(),
                height: this.getHeight(),
                isaudio: this.isAudio(),
                contenttype: this.get('contentType')
            };
            // TODO - this needs to be handled better
            // If the settings model hasn't been updated yet with default audio settings
            // if (this.isAudio() && !settingsModel.get('isaudio')) {
            //     _.extend(attrs, {
            //         showtitle: false,
            //         annotations: false,
            //         captionsearch: false,
            //         attachments: false,
            //         links: false,
            //         metadata: false,
            //         dateproduced: false,
            //         isaudio: true
            //     });
            // }
            settingsModel.set(attrs, { silent: true });
        }
    });

});
