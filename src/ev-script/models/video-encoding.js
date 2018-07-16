define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        BaseModel = require('ev-script/models/base'),
        _ = require('underscore'),
        cacheUtil = require('ev-script/util/cache');

    return BaseModel.extend({
        cacheName: 'encodings',
        // initialize: function(attributes, options) {
        //     BaseModel.prototype.initialize.call(this, attributes, options);
        // },
        getDims: function(original) {
            var dims = [],
                originalWidth = parseInt(this.get('width'), 10) || 848,
                originalHeight = parseInt(this.get('height'), 10) || 480;
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
        updateSettingsModel: function(settingsModel) {
            var attrs = {
                width: this.getWidth(),
                height: this.getHeight(),
                isaudio: this.isAudio(),
                contenttype: this.get('contentType')
            };
            settingsModel.set(attrs, { silent: true });
        }
    });

});
