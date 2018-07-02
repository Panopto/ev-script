define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.View.extend({
        initialize: function(options) {
            this.config = cacheUtil.getConfig();
            this.root = cacheUtil.getRoot();
            this.auth = cacheUtil.getAuth();
            this.info = cacheUtil.getInfo();
            this.appEvents = eventsUtil.getEvents();
            this.globalEvents = eventsUtil.getEvents('global');
            this.i18n = cacheUtil.getI18n();
        },
        ajaxError: function(collection, xhr, options) {
            if (xhr.status === 401) {
                // TODO - add to messages
                window.alert(this.i18n.formatMessage('You are unauthorized to perform this action.'));
                // this.auth.handleUnauthorized(this.el, authCallback);
            } else if (xhr.status === 500) {
                window.alert(this.i18n.formatMessage('It appears there is an issue with the Ensemble Video installation.'));
            } else if (xhr.status === 404) {
                window.alert(this.i18n.formatMessage('Could not find requested resource.  This is likely a problem with the configured Ensemble Video base url.'));
            } else if (xhr.status !== 0) {
                window.alert(this.i18n.formatMessage('An unexpected error occurred.  Check the server log for more details.'));
            }
        },
        unencode: function(encoded) {
            return $('<span/>').html(encoded).text();
        }
    });

});
