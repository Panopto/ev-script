define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        globalEvents = require('ev-script/util/events').getEvents('global');

    return {
        getUser: function(authId) {
            return $.cookie(authId + '-user');
        },
        setAuth: function(authId, authDomain, authPath, username, password) {
            username += (authDomain ? '@' + authDomain : '');
            var cookieOptions = { path: authPath };
            $.cookie(authId + '-user', username, _.extend({}, cookieOptions));
            $.cookie(authId + '-pass', password, _.extend({}, cookieOptions));
            globalEvents.trigger('authSet', authId);
        },
        removeAuth: function(authId, authPath) {
            var cookieOptions = { path: authPath };
            $.cookie(authId + '-user', null, _.extend({}, cookieOptions));
            $.cookie(authId + '-pass', null, _.extend({}, cookieOptions));
            globalEvents.trigger('authRemoved', authId);
        },
        hasAuth: function(authId) {
            return $.cookie(authId + '-user') && $.cookie(authId + '-pass');
        }
    };

});
