define(function(require) {

    'use strict';

    var BaseModel = require('ev-script/models/base'),
        _ = require('underscore');

    return BaseModel.extend({
        cacheName: 'videos',
        collectionKey: 'contents',
        parse: function(response, options) {
            response._embedded.contents = _.map(response._embedded.sharing, function(share) {
                return share._embedded['ev:Contents/Get'];
            });
            return response;
        }
    });

});
