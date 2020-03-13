define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        FieldView = require('ev-script/views/field'),
        BaseCollection = require('ev-script/collections/base'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        PlaylistPickerView = require('ev-script/views/playlist-picker'),
        PlaylistSettingsView = require('ev-script/views/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview'),
        Categories = require('ev-script/models/categories');

    return FieldView.extend({
        initialize: function(options) {
            FieldView.prototype.initialize.call(this, options);
            // Other functions are bound in base field view
            _.bindAll(this, 'getCategorySearchUrl');
        },
        getCategorySearchUrl: function() {
            var playlist = this.model.get('content'),
                searchLink = playlist._links['ev:PlaylistCategory/Search'],
                searchUrl = searchLink ? searchLink.href : null,
                template = searchUrl ? new URITemplate(searchUrl) : null;
            return template ? template.expand({}) : null;
        },
        initCallback: function() {
            // Recursively load pages until we have all categories.
            var fetchCategories = _.bind(function(url, categories) {
                    if (!url) {
                        return;
                    }
                    var categorySearch = new Categories({}, {
                        href: url
                    });
                    categorySearch.fetch({
                        picker: this.picker,
                        success: _.bind(function(model, response, options) {
                            var next = model.getLink('next'),
                                embeddedCats = model.getEmbedded(model.collectionKey);
                            if (embeddedCats) {
                                categories.add(embeddedCats.models);
                            }
                            if (next) {
                                fetchCategories(next.href);
                            } else {
                                categories.trigger('reset');
                            }
                        }, this),
                        error: _.bind(this.ajaxError, this)
                    });
                }, this);

            this.categories = new BaseCollection(null, {});

            if (!this.model.isNew()) {
                fetchCategories(this.getCategorySearchUrl(), this.categories);
            }
            this.model.on('change', _.bind(function() {
                // If the id has changed, we need to refetch categories
                if (this.model.changed.id) {
                    this.categories.reset([], { silent: true });
                    // Only fetch categories if identifier is set
                    if (!this.model.isNew()) {
                        fetchCategories(this.getCategorySearchUrl(), this.categories);
                    }
                }
                if (!this.model.isNew()) {
                    if (this.model.changed.layout) {
                        var layout = this.model.get('layout');

                        switch (layout) {
                            case 'list':
                            case 'grid':
                                this.model.set({
                                    'width': 800,
                                    'height': 720
                                });
                                break;
                            case 'listWithPlayer':
                            case 'gridWithPlayer':
                                this.model.set({
                                    'width': 700,
                                    'height': 750
                                });
                                break;
                            case 'verticalListWithPlayer':
                                this.model.set({
                                    'width': 1000,
                                    'height': 420
                                });
                                break;
                            case 'horizontalListWithPlayer':
                                this.model.set({
                                    'width': 800,
                                    'height': 690
                                });
                                break;
                            case 'showcase':
                                this.model.set({
                                    'width': 1000,
                                    'height': 590
                                });
                                break;
                            case 'horizontalList':
                                this.model.set({
                                    'width': 1000,
                                    'height': 230
                                });
                                break;
                            case 'loop':
                                this.model.set({
                                    'width': 800,
                                    'height': 455
                                });
                                break;
                            default:
                                this.model.set({
                                    'width': 800,
                                    'height': 1000
                                });
                        }
                    }
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
