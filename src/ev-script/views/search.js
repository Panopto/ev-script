define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/video-search.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'searchHandler', 'doSearch', 'autoSearch');
            this.picker = options.picker;
        },
        events: {
            'submit form': 'searchHandler',
            'change .source': 'searchHandler',
            'keyup .search': 'autoSearch'
        },
        render: function() {
            this.$el.html(this.template({
                id: this.id + '-input',
                searchVal: this.picker.model.get('search'),
                sourceId: this.picker.model.get('sourceId')
            }));
            var $loader = this.$('div.loader');
            $loader.on('ajaxSend', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.addClass('loading');
                }
            }, this)).on('ajaxComplete', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.removeClass('loading');
                }
            }, this));
        },
        doSearch: function() {
            this.picker.model.set({
                search: this.$('.search').val(),
                sourceId: this.$('.source').val()
            });
            this.picker.loadVideos();
        },
        searchHandler: function(e) {
            this.doSearch();
            e.preventDefault();
        },
        autoSearch: function(e) {
            var value = e.target.value;
            if (value !== this.lastValue) {
                this.lastValue = value;
                if (this.submitTimeout) {
                    clearTimeout(this.submitTimeout);
                }
                this.submitTimeout = setTimeout(_.bind(function() {
                    this.doSearch();
                }, this), 1000);
            }
        }
    });

});
