define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        UnitSelectsView = require('ev-script/views/unit-selects'),
        SearchView = require('ev-script/views/search'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/collections/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadPlaylists', 'changeLibrary', 'handleSubmit');
            this.$filterBlock = this.$('div.ev-filter-block');
            this.searchView = new SearchView({
                id: this.id + '-search',
                tagName: 'div',
                className: 'ev-search',
                picker: this,
                appId: this.appId,
                callback: _.bind(function() {
                    this.loadPlaylists();
                }, this)
            });
            this.$filterBlock.prepend(this.searchView.$el);
            this.searchView.render();
            this.unitSelects = new UnitSelectsView({
                id: this.id + '-unit-selects',
                tagName: 'div',
                className: 'ev-unit-selects',
                picker: this,
                appId: this.appId
            });
            this.$filterBlock.prepend(this.unitSelects.$el);
            this.resultsView = new PlaylistResultsView({
                el: this.$('div.ev-results'),
                picker: this,
                appId: this.appId
            });
            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click a.action-add': 'chooseItem',
            'change .unit-selects select.libraries': 'changeLibrary',
            'submit .unit-selects': 'handleSubmit'
        },
        changeLibrary: function(e) {
            this.loadPlaylists();
        },
        handleSubmit: function(e) {
            this.loadPlaylists();
            e.preventDefault();
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.unitSelects.loadOrgs();
            this.unitSelects.$('select').filter(':visible').first().focus();
        },
        loadPlaylists: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                libraryId = this.model.get('libraryId'),
                playlists = new Playlists({}, {
                    libraryId: libraryId,
                    filterValue: searchVal,
                    appId: this.appId
                }),
                clearPlaylistsCache = _.bind(function() {
                    playlists.clearCache();
                    this.loadPlaylists();
                }, this);
            playlists.fetch({
                picker: this,
                cacheKey: libraryId + searchVal,
                success: _.bind(function(collection, response, options) {
                    var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                    var size = _.size(response.Data);
                    if (size === totalRecords) {
                        collection.hasMore = false;
                    } else {
                        collection.hasMore = true;
                        collection.pageIndex += 1;
                    }
                    this.resultsView.collection = collection;
                    this.resultsView.render();
                }, this),
                error: _.bind(function(collection, xhr, options) {
                    this.ajaxError(xhr, _.bind(function() {
                        this.loadPlaylists();
                    }, this));
                }, this)
            });
            this.appEvents.off('reloadPlaylists').on('reloadPlaylists', clearPlaylistsCache);
        }
    });

});
