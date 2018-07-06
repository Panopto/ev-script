define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        // initialize: function(attributes, options) {
        //     BaseModel.prototype.initialize.call(this, attributes, options);
        // }
        getUser: function() {
            return this.getEmbedded('ev:Users/Current');
        }
    });

});
