define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        VideoSettings = require('ev-script/models/video-settings'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        VideoPickerView = require('ev-script/views/video-picker'),
        VideoSettingsView = require('ev-script/views/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview'),
        VideoEncoding = require('ev-script/models/video-encoding'),
        PlaylistPickerView = require('ev-script/views/playlist-picker'),
        PlaylistSettingsView = require('ev-script/views/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview'),
        Categories = require('ev-script/collections/categories');

    /*
     * View for our field (element that we set with the selected content identifier)
     * TODO - this needs to be broken up, and model event handling is messy/confusing
     */
    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/field.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'chooseHandler', 'optionsHandler', 'removeHandler', 'previewHandler', 'resizePicker');
            this.$field = options.$field;
            this.showChoose = true;
            var pickerOptions = {
                    id: this.id + '-picker',
                    tagName: 'div',
                    className: 'ev-' + this.model.get('type') + '-picker',
                    field: this,
                    appId: this.appId
                },
                settingsOptions = {
                    id: this.id + '-settings',
                    tagName: 'div',
                    className: 'ev-settings',
                    field: this,
                    appId: this.appId
                },
                updateField = _.bind(function() {
                    var json = this.model.toJSON();
                    this.$field.val(JSON.stringify(json));
                    this.appEvents.trigger('fieldUpdated', this.$field, json);
                    this.renderActions();
                }, this);
            if (this.model instanceof VideoSettings) {
                this.modelClass = VideoSettings;
                this.pickerClass = VideoPickerView;
                this.settingsClass = VideoSettingsView;
                this.previewClass = VideoPreviewView;
                this.encoding = new VideoEncoding({}, {
                    appId: this.appId
                });
                if (!this.model.isNew()) {
                    this.encoding.set({
                        fetchId: this.model.id
                    });
                    this.encoding.fetch();
                }
                this.model.on('change', _.bind(function() {
                    // If the id has changed, we need to fetch the relevant encoding
                    if (this.model.changed.id) {
                        this.encoding.clear();
                        // Only fetch encoding if identifier is set
                        if (!this.model.isNew()) {
                            this.encoding.set({
                                fetchId: this.model.id
                            });
                            this.encoding.fetch({
                                success: _.bind(function(response) {
                                    // Note this while trigger another change
                                    this.encoding.updateSettingsModel(this.model);
                                    // Picker model is a copy so need to update that as well
                                    this.encoding.updateSettingsModel(this.picker.model);
                                    updateField();
                                }, this)
                            });
                        }
                    } else {
                        if (!this.model.isNew()) {
                            updateField();
                        }
                    }
                }, this));
                _.extend(settingsOptions, {
                    encoding: this.encoding
                });
            } else if (this.model instanceof PlaylistSettings) {
                this.modelClass = PlaylistSettings;
                this.pickerClass = PlaylistPickerView;
                this.settingsClass = PlaylistSettingsView;
                this.previewClass = PlaylistPreviewView;
                this.categories = new Categories([], {
                    appId: this.appId
                });
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
                        updateField();
                    }
                }, this));
                _.extend(settingsOptions, {
                    categories: this.categories
                });
            }
            this.picker = new this.pickerClass(_.extend({}, pickerOptions, {
                // We don't want to modify field model until we actually pick a new video...so use a copy as our current model
                model: new this.modelClass(this.model.toJSON()),
            }));
            this.settings = new this.settingsClass(settingsOptions);
            this.$field.after(this.picker.$el);
            this.renderActions();
            this.appEvents.on('showPicker', function(fieldId) {
                if (this.id === fieldId) {
                    this.$('.action-choose').hide();
                    this.showChoose = false;
                    // We only want one picker showing at a time so notify all fields to hide them (unless it's ours)
                    if (this.config.hidePickers) {
                        this.appEvents.trigger('hidePickers', this.id);
                    }
                    this.resizePicker();
                }
            }, this);
            this.appEvents.on('hidePicker', function(fieldId) {
                if (this.id === fieldId) {
                    this.$('.action-choose').show();
                    this.showChoose = true;
                }
            }, this);
            this.appEvents.on('hidePickers', function(fieldId) {
                // When the picker for our field is hidden we need need to show our 'Choose' button
                if (!fieldId || (this.id !== fieldId)) {
                    this.$('.action-choose').show();
                    this.showChoose = true;
                }
            }, this);
            this.appEvents.on('resize', _.bind(function() {
                this.resizePicker();
            }, this));
        },
        events: {
            'click .action-choose': 'chooseHandler',
            'click .action-preview': 'previewHandler',
            'click .action-options': 'optionsHandler',
            'click .action-remove': 'removeHandler'
        },
        chooseHandler: function(e) {
            this.appEvents.trigger('showPicker', this.id);
            e.preventDefault();
        },
        optionsHandler: function(e) {
            this.settings.show();
            e.preventDefault();
        },
        removeHandler: function(e) {
            this.model.clear();
            this.$field.val('');
            // Silent here because we don't want to trigger our change handler above
            // (which would set the field value to our model defaults)
            this.model.set(this.model.defaults, {
                silent: true
            });
            this.appEvents.trigger('fieldUpdated', this.$field);
            this.renderActions();
            e.preventDefault();
        },
        previewHandler: function(e) {
            var element = e.currentTarget;
            var previewView = new this.previewClass({
                el: element,
                encoding: this.encoding,
                model: this.model,
                picker: this.picker,
                appId: this.appId
            });
            e.preventDefault();
        },
        renderActions: function() {
            var ensembleUrl = this.config.ensembleUrl,
                name, label, type, thumbnailUrl;
            if (this.model instanceof VideoSettings) {
                label = this.i18n.formatMessage('Media');
                type = 'video';
            } else {
                label = this.i18n.formatMessage('Playlist');
                type = 'playlist';
            }
            if (this.model.id) {
                name = this.model.id;
                var content = this.model.get('content');
                if (content) {
                    name = content.Name || content.Title;
                    thumbnailUrl = content.ThumbnailUrl;
                }
            }
            if (!this.$actions) {
                this.$actions = $('<div class="ev-field"/>');
                this.$field.after(this.$actions);
            }
            this.$actions.html(this.template({
                i18n: this.i18n,
                ensembleUrl: ensembleUrl,
                modelId: this.model.id,
                label: label,
                type: type,
                name: name,
                thumbnailUrl: thumbnailUrl
            }));
            // If our picker is shown, hide our 'Choose' button
            if (!this.showChoose) {
                this.$('.action-choose').hide();
            }
        },
        resizePicker: function() {
            var extra;
            if (this.config.fitToParent) {
                extra = this.picker.$el.outerHeight(true) - this.picker.$el.height();
                this.picker.setHeight(this.$el.height() - this.$actions.outerHeight(true) - extra);
            }
        }
    });

});
