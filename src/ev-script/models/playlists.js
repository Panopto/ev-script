define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        cacheName: 'playlists',
        collectionKey: 'playlists'
    });

});
