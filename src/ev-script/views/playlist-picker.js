define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        UnitSelectsView = require('ev-script/views/unit-selects'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/collections/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadPlaylists', 'changeLibrary', 'handleSubmit');
            this.unitSelects = new UnitSelectsView({
                id: this.id + '-unit-selects',
                tagName: 'div',
                className: 'ev-unit-selects',
                picker: this,
                appId: this.appId
            });
            this.$('div.ev-filter-block').prepend(this.unitSelects.$el);
            this.resultsView = new PlaylistResultsView({
                el: this.$('div.ev-results'),
                picker: this,
                appId: this.appId
            });
            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click a.action-add': 'chooseItem',
            'change form.unit-selects select.libraries': 'changeLibrary',
            'submit form.unit-selects': 'handleSubmit'
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
            var libraryId = this.model.get('libraryId');
            var playlists = new Playlists({}, {
                filterValue: libraryId,
                appId: this.appId
            });
            playlists.fetch({
                picker: this,
                cacheKey: libraryId,
                success: _.bind(function(collection, response, options) {
                    var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                    var size = _.size(response.Data);
                    if(size === totalRecords) {
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
        }
    });

});
