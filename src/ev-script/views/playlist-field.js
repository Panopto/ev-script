define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        FieldView = require('ev-script/views/field'),
        BaseCollection = require('ev-script/collections/base'),
        BaseModel = require('ev-script/models/base'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        PlaylistPickerView = require('ev-script/views/playlist-picker'),
        PlaylistSettingsView = require('ev-script/views/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview'),
        Categories = require('ev-script/models/categories'),
        CustomOrders = require('ev-script/models/custom-orders');

    return FieldView.extend({
        initialize: function(options) {
            FieldView.prototype.initialize.call(this, options);
            // Other functions are bound in base field view
            _.bindAll(this, 'getCategorySearchUrl', 'getAllOrdersUrl', 'getSortUrl');
        },
        getCategorySearchUrl: function() {
            var playlist = this.model.get('content'),
                searchLink = playlist._links['ev:PlaylistCategory/Search'],
                searchUrl = searchLink ? searchLink.href : null,
                template = searchUrl ? new URITemplate(searchUrl) : null;
            return template ? template.expand({}) : null;
        },
        getAllOrdersUrl: function() {
            var playlist = this.model.get('content'),
                searchLink = playlist._links['ev:PlaylistOrders/GetAll'],
                searchUrl = searchLink ? searchLink.href : null,
                template = searchUrl ? new URITemplate(searchUrl) : null;
            return template ? template.expand({}) : null;
        },
        getSortUrl: function() {
            var playlist = this.model.get('content'),
                searchLink = playlist._links['ev:PlaylistSort/Get'],
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
                }, this),
                fetchOrders = _.bind(function(url, orders) {
                    if (!url) {
                        return;
                    }
                    var customOrders = new CustomOrders({}, {
                        href: url
                    });
                    customOrders.fetch({
                        picker: this.picker,
                        success: _.bind(function(model, response, options) {
                            var embeddedOrders = model.getEmbedded(model.collectionKey);
                            if (embeddedOrders) {
                                orders.add(embeddedOrders.models);
                            }
                            orders.trigger('reset');
                        }, this),
                        error: _.bind(this.ajaxError, this)
                    });
                }, this),
                fetchSort = _.bind(function(url) {
                    if (!url) {
                        return;
                    }
                    var sort = new BaseModel({}, { 'href': url });
                    sort.fetch({
                        picker: this.picker,
                        success: _.bind(function(model, response, options) {
                            this.model.set('sortby', response.orderBy);
                            if (response.orderBy === 'CustomPosition') {
                                this.model.set('customorder', response.customOrderId);
                            } else if (response.orderBy) {
                                this.model.set('desc', response.orderByDirection === 'desc');
                            }
                        }, this),
                        error: _.bind(this.ajaxError, this)
                    });
                }, this);

            this.categories = new BaseCollection(null, {});
            this.orders = new BaseCollection(null, {});

            if (!this.model.isNew()) {
                fetchCategories(this.getCategorySearchUrl(), this.categories);
                fetchOrders(this.getAllOrdersUrl(), this.orders);
                fetchSort(this.getSortUrl());
            }
            this.model.on('change', _.bind(function() {
                // If the id has changed, we need to refetch categories, custom orders and current sort
                if (this.model.changed.id) {
                    this.categories.reset([], { silent: true });
                    this.orders.reset([], { silent: true });
                    // Only fetch if identifier is set
                    if (!this.model.isNew()) {
                        fetchCategories(this.getCategorySearchUrl(), this.categories);
                        fetchOrders(this.getAllOrdersUrl(), this.orders);
                        fetchSort(this.getSortUrl());
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
                categories: this.categories,
                orders: this.orders
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
