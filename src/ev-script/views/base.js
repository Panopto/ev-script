define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        Backbone = require('backbone'),
        eventsUtil = require('ev-script/util/events'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'destroy', 'ajaxError', 'trigger');

            this.config = cacheUtil.getConfig();
            this.root = cacheUtil.getRoot();
            this.info = cacheUtil.getInfo();
            this.events = eventsUtil.getEvents();
            this.i18n = cacheUtil.getI18n();
            this.auth = cacheUtil.getAuth();

            this.events.on('destroy', this.destroy);

            this.events.on('localeUpdated', _.bind(function(i18n) {
                this.i18n = i18n;
            }, this));
        },
        destroy: function(context) {
            if (this.field && this.field === context) {
                this.undelegateEvents();
                this.remove();
            }
        },
        ajaxError: function(collection, xhr, options) {
            if (xhr.status === 401) {
                this.events.trigger('hidePickers');
                this.events.trigger('loggedOut');
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
        },
        trigger: function(name) {
            log.debug('[views/base] Event triggered: ' + name);
            log.debug({
                this: this,
                arguments: arguments
            });
            return Backbone.View.prototype.trigger.apply(this, arguments);
        }
    });

});
