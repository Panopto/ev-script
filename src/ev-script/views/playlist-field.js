define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        FieldView = require('ev-script/views/field'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        PlaylistPickerView = require('ev-script/views/playlist-picker'),
        PlaylistSettingsView = require('ev-script/views/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview'),
        Categories = require('ev-script/collections/categories');

    return FieldView.extend({
        initialize: function(options) {
            FieldView.prototype.initialize.call(this, options);
        },
        initCallback: function() {
            this.categories = new Categories([], {});

            if (!this.model.isNew()) {
                this.categories.playlistId = this.model.id;
                this.categories.fetch({ reset: true });
            }
            this.model.on('change', _.bind(function() {
                // If the id has changed, we need to fetch the relevant encoding
                if (this.model.changed.id) {
                    // Only fetch categories if identifier is set
                    if (!this.model.isNew()) {
                        this.categories.playlistId = this.model.id;
                        this.categories.fetch({ reset: true });
                    } else {
                        this.categories.reset([], { silent: true });
                        this.categories.playlistId = '';
                    }
                }
                if (!this.model.isNew()) {
                    this.updateField();
                }
            }, this));
        },
        getPickerInstance: function(pickerOptions) {
            return new PlaylistPickerView(_.extend({}, pickerOptions, {
                model: new PlaylistSettings(this.model.toJSON()),
            }));
        },
        getSettingsInstance: function(settingsOptions) {
            return new PlaylistSettingsView(_.extend(settingsOptions, {
                categories: this.categories
            }));
        },
        getPreviewInstance: function(previewOptions) {
            return new PlaylistPreviewView(previewOptions);
        },
        getFieldType: function() {
            return 'playlist';
        },
        getFieldLabel: function() {
            return this.i18n.formatMessage('Playlist');
        }
    });

});
