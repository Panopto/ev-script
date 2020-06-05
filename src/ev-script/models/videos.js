define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base'),
        cacheUtil = require('ev-script/util/cache'),
        URI = require('urijs/URI'),
        _ = require('underscore');

    return BaseModel.extend({
        cacheName: 'videos',
        collectionKey: 'contents'
        // initialize: function(attributes, options) {
        //     BaseModel.prototype.initialize.call(this, attributes, options);
        // },
    });

});
