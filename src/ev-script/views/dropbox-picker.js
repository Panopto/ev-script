define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        PickerView = require('ev-script/views/picker'),
        FilterView = require('ev-script/views/filter'),
        DropboxResultsView = require('ev-script/views/dropbox-results'),
        Dropboxes = require('ev-script/models/dropboxes');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);

            _.bindAll(this, 'loadDropboxes', 'changeLibrary', 'handleSubmit',
            'handleSearch');

            this.events
            .off('search', this.handleSearch)
            .on('search', this.handleSearch);

            var reload = _.bind(function(target) {
                if (target === 'dropboxes') {
                    this.loadDropboxes();
                }
            }, this);
            this.events
            .off('reload', reload)
            .on('reload', reload);

            // TODO - handle callback
            this.filter = new FilterView({
                id: this.id + '-filter',
                el: this.$('.ev-filter-block'),
                picker: this,
                showTypeSelect: false
            });

            this.resultsView = new DropboxResultsView({
                el: this.$('div.ev-results'),
                picker: this
            });

            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click a.action-add': 'chooseItem',
            'change .ev-filter-block select.libraries': 'changeLibrary',
            'submit .ev-filter-block': 'handleSubmit'
        },
        changeLibrary: function(e) {
            this.loadDropboxes();
        },
        handleSubmit: function(e) {
            this.loadDropboxes();
            e.preventDefault();
        },
        handleSearch: function(model) {
            if (model === this.model) {
                this.loadDropboxes();
            }
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.filter.loadOrgs();
            this.filter.setFocus();
        },
        loadDropboxes: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                libraryId = this.model.get('libraryId'),
                library = this.filter.getLibrary(libraryId),
                searchTemplate = new URITemplate(library.getLink('ev:Dropboxes/Search').href),
                searchUrl = searchTemplate.expand({
                    search: searchVal,
                    sortBy: 'title',
                    pageSize: 20
                }),
                dropboxes = new Dropboxes({}, {
                    href: searchUrl
                });
            dropboxes.fetch({
                picker: this,
                success: _.bind(function(model, response, options) {
                    this.resultsView.model = model;
                    this.resultsView.collection = model.getEmbedded('dropboxes');
                    this.resultsView.render();
                }, this),
                error: _.bind(this.ajaxError, this)
            });
        }
    });

});
