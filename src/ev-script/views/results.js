/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    /*
     * Base object for result views since video and playlist results are rendered differently
     */
    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render', 'loadMore', 'addHandler', 'previewItem');
            this.picker = options.picker;
            this.$results = $('<div class="results"/>');
            this.$el.append(this.$results);
            this.appId = options.appId;
        },
        events: {
            'click a.action-preview': 'previewItem'
        },
        previewItem: function(e) {
            var element = e.currentTarget;
            var id = $(element).attr('rel');
            var item = this.collection.get(id);
            var settings = {
                id: id,
                content: item.toJSON(),
                appId: this.appId
            };
            var previewView = new this.previewClass({
                el: element,
                model: new this.modelClass(settings),
                appId: this.appId
            });
            // Stop event propagation so we don't trigger preview of stored field item as well
            e.stopPropagation();
            e.preventDefault();
        },
        loadMore: function() {
            if (this.collection.hasMore) {
                this.collection.fetch({
                    // This needs to be synchronous so it blocks additional scrolling during load.
                    // FIXME - add a loading indicator?
                    // TODO - move to deferred once a more recent version of jQuery is available?  The loading triggered at the bottom
                    // is choppy.  It'd be nice to trigger a non-blocking load after scrolling down some portion of the results.
                    async: false,
                    add: true,
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        if (_.size(response.Data) < collection.pageSize) {
                            collection.hasMore = false;
                            this.$scrollLoader.evScrollLoader('hideLoader');
                        } else {
                            collection.hasMore = true;
                            collection.pageIndex += 1;
                        }
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.ajaxError(xhr, _.bind(function() {
                            this.loadMore();
                        }, this));
                    }, this)
                });
            }
        },
        addHandler: function(item, collection, options) {
            var row = this.getRowHtml(item, options.index);
            this.$('table.content-list > tbody').append(row);
        }
    });

});
