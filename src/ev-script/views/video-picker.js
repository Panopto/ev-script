define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        SearchView = require('ev-script/views/search'),
        TypeSelectView = require('ev-script/views/library-type-select'),
        UnitSelectsView = require('ev-script/views/unit-selects'),
        VideoResultsView = require('ev-script/views/video-results'),
        Videos = require('ev-script/collections/videos'),
        MediaWorkflows = require('ev-script/collections/media-workflows'),
        UploadView = require('ev-script/views/upload');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadVideos', 'loadWorkflows', 'changeLibrary', 'handleSubmit', 'uploadHandler');
            var callback = _.bind(function() {
                this.loadVideos();
            }, this);
            if (this.info.get('ApplicationVersion')) {
                this.$upload = $('<div class="ev-actions"><div class="action-upload"><div class="upload-icon"></div><a href="#" class="upload-link" title="Upload"><span>Upload<span></a></div></div>').css('display', 'none');
                this.$('div.ev-filter-block').prepend(this.$upload);
            }
            this.searchView = new SearchView({
                id: this.id + '-search',
                tagName: 'div',
                className: 'ev-search',
                picker: this,
                appId: this.appId,
                callback: callback
            });
            this.$('div.ev-filter-block').prepend(this.searchView.$el);
            this.searchView.render();
            this.typeSelectView = new TypeSelectView({
                id: this.id + '-type-select',
                tagName: 'div',
                className: 'ev-type-select',
                picker: this,
                appId: this.appId,
                callback: callback
            });
            this.$('div.ev-filter-block').prepend(this.typeSelectView.$el);
            this.typeSelectView.render();
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
            this.resultsView = new VideoResultsView({
                el: this.$('div.ev-results'),
                picker: this,
                appId: this.appId
            });
            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click .action-add': 'chooseItem',
            'click .action-upload': 'uploadHandler',
            'change form.unit-selects select.libraries': 'changeLibrary',
            'submit form.unit-selects': 'handleSubmit'
        },
        changeLibrary: function(e) {
            this.loadVideos();
            this.loadWorkflows();
        },
        handleSubmit: function(e) {
            this.loadVideos();
            e.preventDefault();
        },
        uploadHandler: function(e) {
            var uploadView = new UploadView({
                appId: this.appId,
                field: this.field,
                workflows: this.workflows
            });
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
        },
        loadWorkflows: function() {
            this.workflows = new MediaWorkflows({}, {
                appId: this.appId
            });
            // FIXME - add libraryId (as with playlists)
            this.workflows.filterValue = this.model.get('libraryId');
            this.workflows.fetch({
                cacheKey: this.workflows.filterValue,
                success: _.bind(function(collection, response, options) {
                    if (!collection.isEmpty()) {
                        this.$upload.css('display', 'inline-block');
                    } else {
                        this.$upload.css('display', 'none');
                    }
                }, this),
                error: _.bind(function(collection, xhr, options) {
                    this.ajaxError(xhr, _.bind(function() {
                        this.loadWorkflows();
                    }, this));
                }, this),
                reset: true
            });
        }
    });

});
