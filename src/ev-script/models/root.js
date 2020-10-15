define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        getUser: function() {
            var user = this.getEmbedded('ev:Users/Current');
            return user && user.get('isProvisioned') ? user : null;
        }
    });

});
