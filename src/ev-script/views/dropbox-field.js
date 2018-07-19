define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        FieldView = require('ev-script/views/field'),
        DropboxSettings = require('ev-script/models/dropbox-settings'),
        DropboxPickerView = require('ev-script/views/dropbox-picker'),
        DropboxSettingsView = require('ev-script/views/dropbox-settings'),
        DropboxPreviewView = require('ev-script/views/dropbox-preview');

    return FieldView.extend({
        initialize: function(options) {
            FieldView.prototype.initialize.call(this, options);
        },
        initCallback: function() {
            this.model.on('change', _.bind(function() {
                if (!this.model.isNew()) {
                    this.updateField();
                }
            }, this));
        },
        getPickerInstance: function(pickerOptions) {
            return new DropboxPickerView(_.extend({}, pickerOptions, {
                // Picker uses a copy of the supplied settings model
                model: new DropboxSettings(this.model.toJSON()),
            }));
        },
        getSettingsInstance: function(settingsOptions) {
            return false;
            // TODO - disabling settings until we have proper embed handling
            // return new DropboxSettingsView(settingsOptions);
        },
        getPreviewInstance: function(previewOptions) {
            return new DropboxPreviewView(previewOptions);
        },
        getFieldType: function() {
            return 'dropbox';
        },
        getFieldLabel: function() {
            return this.i18n.formatMessage('Dropbox');
        }
    });

});
