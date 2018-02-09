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
            _.bindAll(this, 'render', 'decorate', 'loadMore', 'addHandler', 'previewItem', 'refreshHandler');
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
        decorate: function($item) {
            // For keyboard accessibility, add result item to tab flow
            $item.attr('tabindex', '0');
            // ...and programmatically focus on interactive elements
            var focusedIndex;
            // when item receives focus reset item action index and scroll to top
            $item.focus(_.bind(function() {
                var $interEls = $('a', $item);
                $interEls.attr('tabindex', '-1');
                focusedIndex = -1;
                this.$scrollLoader.evScrollLoader('scrollTo', $item.offset().top - 2);
            }, this));
            $item.keydown(_.bind(function(e) {
                var $interEls,
                    $prevAll,
                    $nextAll,
                    lastIndex,
                    index,
                    isScrolled = _.bind(function(reverse) {
                        var itemHeight = $item.height(),
                            $wrap = this.$scrollLoader.closest('.scrollWrap'),
                            scrollHeight = $wrap.height(),
                            clearReq = itemHeight - scrollHeight,
                            itemOffset = $item.offset().top,
                            scrollOffset = $wrap.offset().top,
                            clearAct = itemOffset - scrollOffset;
                        return reverse ? clearAct >= 0 : Math.abs(clearAct) >= clearReq;
                    }, this);
                if (e.which === 33 || e.keyCode === 33) {
                    e.preventDefault();
                    // page up
                    $prevAll = $item.prevAll();
                    if (!$prevAll.length) {
                        return;
                    }
                    // Note: items are searched up in order
                    index = 10;
                    lastIndex = $prevAll.length - 1;
                    index = index > lastIndex ? lastIndex : index;
                    $prevAll.eq(index).focus();
                } else if (e.which === 34 || e.keyCode === 34) {
                    e.preventDefault();
                    // page down
                    $nextAll = $item.nextAll();
                    if (!$nextAll.length) {
                        return;
                    }
                    index = 10;
                    lastIndex = $nextAll.length - 1;
                    index = index > lastIndex ? lastIndex : index;
                    $nextAll.eq(index).focus();
                } else if (e.which === 35 || e.keyCode === 35) {
                    e.preventDefault();
                    // end key should jump to bottom
                    $nextAll = $item.nextAll();
                    if (!$nextAll.length) {
                        return;
                    }
                    $nextAll.last().focus();
                } else if (e.which === 36 || e.keyCode === 36) {
                    e.preventDefault();
                    // home key should jump to top
                    // Note: as w/ page up above, the last previous item is the
                    // first in our list of results
                    $prevAll = $item.prevAll();
                    if (!$prevAll.length) {
                        return;
                    }
                    $prevAll.last().focus();
                } else if (e.which === 37 || e.keyCode === 37) {
                    e.preventDefault();
                    // left arrow move to previous item action
                    $interEls = $('a:visible', $item);
                    if (!$interEls.length) {
                        return;
                    }
                    lastIndex = $interEls.length - 1;
                    focusedIndex = --focusedIndex < 0 ? lastIndex : focusedIndex;
                    focusedIndex = focusedIndex > lastIndex ? lastIndex : focusedIndex;
                    $interEls.eq(focusedIndex).focus();
                } else if ((e.which === 38 || e.keyCode === 38) && isScrolled(true)) {
                    e.preventDefault();
                    // up arrow move to previous item
                    var $previous = $item.prev();
                    if ($previous && $previous.length) {
                        $previous.focus();
                    }
                } else if (e.which === 39 || e.keyCode === 39) {
                    e.preventDefault();
                    // right arrow move to next item action
                    $interEls = $('a:visible', $item);
                    if (!$interEls.length) {
                        return;
                    }
                    lastIndex = $interEls.length - 1;
                    focusedIndex = ++focusedIndex > lastIndex ? 0 : focusedIndex;
                    $interEls.eq(focusedIndex).focus();
                } else if ((e.which === 40 || e.keyCode === 40) && isScrolled()) {
                    e.preventDefault();
                    // down arrow move to next item
                    var $next = $item.next();
                    if ($next && $next.length) {
                        $next.focus();
                    }
                }
            }, this));
        },
        render: function() {
            this.$el.html(this.resultsTemplate({
                i18n: this.i18n,
                totalResults: this.collection.totalResults
            }));
            this.$total = this.$('.total');
            this.$results = this.$('.results');
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
        refreshHandler: function(e) {}
    });

});