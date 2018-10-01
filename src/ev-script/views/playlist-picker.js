define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        PickerView = require('ev-script/views/picker'),
        FilterView = require('ev-script/views/filter'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/models/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);

            _.bindAll(this, 'loadPlaylists', 'changeLibrary', 'handleSubmit',
            'handleSearch');

            this.events
            .off('search', this.handleSearch)
            .on('search', this.handleSearch);

            var reload = _.bind(function(target) {
                if (target === 'playlists') {
                    this.loadPlaylists();
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

            this.resultsView = new PlaylistResultsView({
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
            this.loadPlaylists();
        },
        handleSubmit: function(e) {
            this.loadPlaylists();
            e.preventDefault();
        },
        handleSearch: function(model) {
            if (model === this.model) {
                this.loadPlaylists();
            }
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.filter.loadOrgs();
            this.filter.setFocus();
        },
        loadPlaylists: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                searchTemplate = new URITemplate(this.root.getLink('ev:Playlists/Search').href),
                searchUrl = searchTemplate.expand({
                    organizationId: this.model.get('organizationId'),
                    libraryId: this.model.get('libraryId'),
                    search: searchVal,
                    sortBy: 'title',
                    pageSize: 20
                }),
                playlists = new Playlists({}, {
                    href: searchUrl
                });
            playlists.fetch({
                picker: this,
                success: _.bind(function(model, response, options) {
                    this.resultsView.model = model;
                    this.resultsView.collection = model.getEmbedded('playlists');
                    this.resultsView.render();
                }, this),
                error: _.bind(this.ajaxError, this)
            });
        }
    });

});
