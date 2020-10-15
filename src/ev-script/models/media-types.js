define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseModel.extend({
        cacheName: 'mediaTypes',
        collectionKey: 'mediaTypes'
    });

});
