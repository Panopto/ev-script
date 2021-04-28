define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        cacheName: 'orders',
        collectionKey: 'orders'
    });

});
