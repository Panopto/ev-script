define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        globalEvents = require('ev-script/util/events').getEvents('global');

    return {
        getUser: function(ensembleUrl) {
            return $.cookie(ensembleUrl + '-user');
        },
        login: function(ensembleUrl, authDomain, authPath, username, password) {
            username += (authDomain ? '@' + authDomain : '');
            var cookieOptions = { path: authPath };
            $.cookie(ensembleUrl + '-user', username, _.extend({}, cookieOptions));
            $.cookie(ensembleUrl + '-pass', password, _.extend({}, cookieOptions));
            globalEvents.trigger('loggedIn', ensembleUrl);
        },
        logout: function(ensembleUrl, authPath) {
            var cookieOptions = { path: authPath };
            $.cookie(ensembleUrl + '-user', null, _.extend({}, cookieOptions));
            $.cookie(ensembleUrl + '-pass', null, _.extend({}, cookieOptions));
            globalEvents.trigger('loggedOut', ensembleUrl);
        },
        isAuthenticated: function(ensembleUrl) {
            return $.cookie(ensembleUrl + '-user') && $.cookie(ensembleUrl + '-pass');
        }
    };

});
