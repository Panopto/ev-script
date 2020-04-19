define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseModel.extend({
        cacheName: 'organizations',
        collectionKey: 'organizations'
        // initialize: function(models, options) {
        //     BaseModel.prototype.initialize.call(this, models, options);
        // },
    });

});
