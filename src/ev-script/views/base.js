define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        root = this,
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.View.extend({
        initialize: function(options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
            this.auth = cacheUtil.getAppAuth(this.appId);
            this.appEvents = eventsUtil.getEvents(this.appId);
            this.globalEvents = eventsUtil.getEvents('global');
        },
        ajaxError: function(xhr, authCallback) {
            if (xhr.status === 401) {
                this.auth.handleUnauthorized(this.el, authCallback);
            } else if (xhr.status === 500) {
                // Making an assumption that root is window here...
                root.alert('It appears there is an issue with the Ensemble Video installation.');
            } else if (xhr.status === 404) {
                root.alert('Could not find requested resource.  This is likely a problem with the configured Ensemble Video base url.');
            } else if (xhr.status !== 0) {
                root.alert('An unexpected error occurred.  Check the server log for more details.');
            }
        },
        getCachedWorkflows: function(user) {
            return cacheUtil.getUserCache(this.config.ensembleUrl, user).get('workflows');
        },
        setCachedWorkflows: function(user, value) {
            return cacheUtil.getUserCache(this.config.ensembleUrl, user).set('workflows', value);
        }
    });

});
