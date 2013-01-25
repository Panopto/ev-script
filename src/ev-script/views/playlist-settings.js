/*global define*/
define(function(require) {

    'use strict';

    var SettingsView = require('ev-script/views/settings');

    return SettingsView.extend({
        initialize: function(options) {
            SettingsView.prototype.initialize.call(this, options);
        },
        render: function() {
            var html =
                // TODO
                '<h3>TODO</h3>' + JSON.stringify(this.field.model.toJSON());
            this.$el.html(html);
            this.$el.dialog({
                title: 'Playlist Embed Settings',
                modal: true,
                autoOpen: false,
                dialogClass: 'ev-dialog'
            });
        }
    });

});
