define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base'),
        cacheUtil = require('ev-script/util/cache');

    return BaseModel.extend({
        cacheName: 'libraries'
        // initialize: function(models, options) {
        //     BaseModel.prototype.initialize.call(this, models, options);
        // },
    });

});
