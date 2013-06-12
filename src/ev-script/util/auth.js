define(function(require) {

    'use strict';

    var BasicAuth = require('ev-script/auth/basic/auth');

    return {
        getAuth: function(appId) {
            return new BasicAuth(appId);
        }
    };
});
