/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        SettingsView = require('ev-script/views/settings');

    return SettingsView.extend({
        template: _.template(require('text!ev-script/templates/playlist-settings.html')),
        initialize: function(options) {
            SettingsView.prototype.initialize.call(this, options);
        },
        render: function() {
            // TODO - fix this template when we have playlist settings implemented
            this.$el.html(this.template({
                json: JSON.stringify(this.field.model.toJSON())
            }));
            this.$el.dialog({
                title: 'Playlist Embed Settings',
                modal: true,
                autoOpen: false,
                dialogClass: 'ev-dialog'
            });
        }
    });

});
