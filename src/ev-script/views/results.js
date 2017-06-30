define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        moment = require('moment'),
        BaseView = require('ev-script/views/base');

    require('ev-scroll-loader');

    /*
     * Base object for result views since video and playlist results are rendered differently
     */
    return BaseView.extend({
        resultsTemplate: _.template(require('text!ev-script/templates/results.html')),
        emptyTemplate: _.template(require('text!ev-script/templates/no-results.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render', 'decorate', 'loadMore', 'addHandler', 'previewItem', 'setHeight', 'resizeResults', 'refreshHandler');
            this.picker = options.picker;
            this.appId = options.appId;
            this.loadLock = false;
        },
        events: {
            'click .action-preview': 'previewItem',
            'click .action-refresh': 'refreshHandler'
        },
        getItemHtml: function(item, index) {
            if (this.resultTemplate) {
                return this.resultTemplate({
                    i18n: this.i18n,
                    dateTimeFormat: this.config.getDateTimeFormat(),
                    moment: moment,
                    item: item,
                    index: index
                });
            }
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
                appId: this.appId,
                picker: this.picker
            });
            // Stop event propagation so we don't trigger preview of stored field item as well
            e.stopPropagation();
            e.preventDefault();
        },
        loadMore: function() {
            if (this.collection.hasMore && !this.loadLock) {
                this.loadLock = true;
                this.collection.fetch({
                    remove: false,
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        if (_.size(response.Data) < this.config.pageSize) {
                            collection.hasMore = false;
                            this.$scrollLoader.evScrollLoader('hideLoader');
                        } else {
                            collection.hasMore = true;
                            collection.pageIndex += 1;
                        }
                        this.loadLock = false;
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.ajaxError(xhr, _.bind(function() {
                            this.loadMore();
                        }, this));
                        this.loadLock = false;
                    }, this)
                });
            }
        },
        addHandler: function(item, collection, options) {
            var $item = $(this.getItemHtml(item, collection.indexOf(item)));
            this.decorate($item);
            this.$('.content-list').append($item);
        },
        // Override this in extending views to update the DOM when items are added
        decorate: function($item) {},
        render: function() {
            this.$el.html(this.resultsTemplate({
                i18n: this.i18n,
                totalResults: this.collection.totalResults
            }));
            this.$total = this.$('.total');
            this.$results = this.$('.results');
            this.resizeResults();
            var $contentList = this.$('.content-list');
            if (!this.collection.isEmpty()) {
                this.collection.each(function(item, index) {
                    var $item = $(this.getItemHtml(item, index));
                    this.decorate($item);
                    $contentList.append($item);
                }, this);
            } else {
                $contentList.append(this.emptyTemplate({
                    i18n: this.i18n
                }));
            }
            var scrollHeight = this.config.scrollHeight;
            this.$scrollLoader = $contentList.evScrollLoader({
                height: scrollHeight,
                onScrolled: this.loadMore
            });
            if (!this.collection.hasMore) {
                this.$scrollLoader.evScrollLoader('hideLoader');
            }
            // Prevent multiple bindings if the collection hasn't changed between render calls
            this.collection.off('add', this.addHandler).on('add', this.addHandler);
        },
        setHeight: function(height) {
            this.$el.height(height);
            this.resizeResults();
        },
        resizeResults: function() {
            if (this.config.fitToParent && this.$results) {
                this.$results.height(this.$el.height() - this.$total.outerHeight(true));
                // Truncation of metadata depends on window size...so re-decorate
                this.$('.resultItem').each(_.bind(function(index, element) {
                    this.decorate($(element));
                }, this));
            }
        },
        refreshHandler: function(e) {}
    });

});
