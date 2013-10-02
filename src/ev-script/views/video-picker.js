define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        SearchView = require('ev-script/views/search'),
        UnitSelectsView = require('ev-script/views/unit-selects'),
        VideoResultsView = require('ev-script/views/video-results'),
        Videos = require('ev-script/collections/videos');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadVideos', 'changeLibrary', 'handleSubmit');
            this.searchView = new SearchView({
                id: this.id + '-search',
                tagName: 'div',
                className: 'ev-search',
                picker: this,
                appId: this.appId
            });
            this.$('div.ev-filter-block').prepend(this.searchView.$el);
            if (this.info.get('ApplicationVersion')) {
                this.unitSelects = new UnitSelectsView({
                    id: this.id + '-unit-selects',
                    tagName: 'div',
                    className: 'ev-unit-selects',
                    picker: this,
                    appId: this.appId
                });
                this.$('div.ev-filter-block').prepend(this.unitSelects.$el);
            }
            this.searchView.render();
            this.resultsView = new VideoResultsView({
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
            this.loadVideos();
        },
        handleSubmit: function(e) {
            this.loadVideos();
            e.preventDefault();
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            if (this.info.get('ApplicationVersion')) {
                this.unitSelects.loadOrgs();
                this.unitSelects.$('select').filter(':visible').first().focus();
            } else {
                this.searchView.$('input[type="text"]').focus();
                this.loadVideos();
            }
        },
        loadVideos: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                sourceId = this.model.get('sourceId'),
                libraryId = this.model.get('libraryId'),
                cacheKey = sourceId + libraryId + searchVal,
                videos = new Videos({}, {
                    sourceId: sourceId,
                    libraryId: libraryId,
                    filterOn: '',
                    filterValue: searchVal,
                    appId: this.appId
                }),
                clearVideosCache = _.bind(function() {
                    videos.clearCache();
                    this.loadVideos();
                }, this);
            videos.fetch({
                picker: this,
                cacheKey: cacheKey,
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
                        this.loadVideos();
                    }, this));
                }, this)
            });
            this.appEvents.off('fileUploaded').on('fileUploaded', clearVideosCache);
        }
    });

});
