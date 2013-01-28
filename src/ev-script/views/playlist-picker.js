/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        PickerView = require('ev-script/views/picker'),
        PlaylistSelectView = require('ev-script/views/playlist-select'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/collections/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadPlaylists');
            this.playlistSelect = new PlaylistSelectView({
                id: this.id + '-playlist-select',
                tagName: 'div',
                className: 'ev-playlist-select',
                picker: this,
                appId: this.appId
            });
            this.$el.append(this.playlistSelect.$el);
            this.resultsView = new PlaylistResultsView({
                id: this.id + '-results',
                tagName: 'div',
                className: 'ev-results clearfix',
                picker: this,
                appId: this.appId
            });
            this.$el.append(this.resultsView.$el);
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.playlistSelect.loadOrgs();
            this.playlistSelect.$('select').filter(':visible').first().focus();
        },
        loadPlaylists: function() {
            var libraryId = this.model.get('libraryId');
            var playlists = this.getCachedPlaylists(this.getUser(), libraryId);
            if(!playlists) {
                playlists = new Playlists({}, {
                    filterValue: libraryId,
                    appId: this.appId
                });
                playlists.fetch({
                    picker: this,
                    success: _.bind(function(collection, response, options) {
                        var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                        var size = _.size(response.Data);
                        if(size === totalRecords) {
                            collection.hasMore = false;
                        } else {
                            collection.hasMore = true;
                            collection.pageIndex += 1;
                        }
                        this.setCachedPlaylists(this.getUser(), libraryId, collection);
                        this.resultsView.collection = collection;
                        this.resultsView.render();
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.ajaxError(xhr, _.bind(function() {
                            this.loadPlaylists();
                        }, this));
                    }, this)
                });
            } else {
                this.resultsView.collection = playlists;
                this.resultsView.render();
            }
        }
    });

});
