define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        FieldView = require('ev-script/views/field'),
        DropboxSettings = require('ev-script/models/dropbox-settings'),
        DropboxPickerView = require('ev-script/views/dropbox-picker'),
        // DropboxSettingsView = require('ev-script/views/dropbox-settings'),
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
                model: new DropboxSettings(this.model.toJSON()),
            }));
        },
        getSettingsInstance: function(settingsOptions) {
            return false;
            // return new DropboxSettingsView(settingsOptions);
        },
        getPreviewInstance: function(previewOptions) {
            return new DropboxPreviewView(_.extend(previewOptions, {
                model: new DropboxSettings({
                    id: previewOptions.selectedItem.get('id'),
                    shortName: previewOptions.selectedItem.get('shortName'),
                    title: previewOptions.selectedItem.get('title')
                })
            }));
        },
        getFieldType: function() {
            return 'dropbox';
        },
        getFieldLabel: function() {
            return this.i18n.formatMessage('Dropbox');
        },
        getActionsHtml: function(templateOptions) {
            _.extend(templateOptions, {
                name: this.chosenItem ? this.chosenItem.get('title') : templateOptions.name
            });
            return FieldView.prototype.getActionsHtml.call(this, templateOptions);
        }
    });

});
