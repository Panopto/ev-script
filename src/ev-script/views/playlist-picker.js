define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        FilterView = require('ev-script/views/filter'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/collections/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadPlaylists', 'changeLibrary', 'handleSubmit');

            this.appEvents.on('search', _.bind(function() {
                this.loadPlaylists();
            }, this));

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
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.filter.loadOrgs();
            this.filter.setFocus();
        },
        loadPlaylists: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                libraryId = this.model.get('libraryId'),
                playlists = new Playlists({}, {
                    libraryId: libraryId,
                    filterValue: searchVal
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
                error: _.bind(this.ajaxError, this)
            });
            this.appEvents.off('reloadPlaylists').on('reloadPlaylists', clearPlaylistsCache);
        }
    });

});
