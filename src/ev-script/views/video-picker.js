/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        SearchView = require('ev-script/views/search'),
        VideoResultsView = require('ev-script/views/video-results'),
        Videos = require('ev-script/collections/videos');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadVideos');
            this.searchView = new SearchView({
                id: this.id + '-search',
                tagName: 'div',
                className: 'ev-search',
                picker: this,
                app: this.app,
            });
            this.$el.append(this.searchView.$el);
            this.searchView.render();
            this.resultsView = new VideoResultsView({
                id: this.id + '-results',
                tagName: 'div',
                className: 'ev-results clearfix',
                picker: this,
                app: this.app
            });
            this.$el.append(this.resultsView.$el);
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.searchView.$('input[type="text"]').focus();
            this.loadVideos();
        },
        loadVideos: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase());
            var sourceId = this.model.get('sourceId');
            var sourceUrl = sourceId === 'content' ? '/api/Content' : '/api/SharedContent';
            var videos = this.app.cache.videosCache[this.app.auth.getUser() + sourceId + searchVal];
            if (!videos) {
                videos = new Videos({}, {
                    sourceUrl: sourceUrl,
                    filterOn: '',
                    filterValue: searchVal,
                    app: this.app
                });
                videos.fetch({
                    picker: this,
                    success: _.bind(function(collection, response, options) {
                        var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                        var size = _.size(response.Data);
                        if (size === totalRecords) {
                            collection.hasMore = false;
                        } else {
                            collection.hasMore = true;
                            collection.pageIndex += 1;
                        }
                        this.app.cache.videosCache[this.app.auth.getUser() + sourceId + searchVal] = collection;
                        this.resultsView.collection = collection;
                        this.resultsView.render();
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
                            this.loadVideos();
                        }, this));
                    }, this)
                });
            } else {
                this.resultsView.collection = videos;
                this.resultsView.render();
            }
        }
    });

});
