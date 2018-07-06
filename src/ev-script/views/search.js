define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/search.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'searchHandler', 'doSearch', 'autoSearch');
            this.picker = options.picker;
            this.render();
        },
        events: {
            'keydown .search': 'searchHandler',
            'keyup .search': 'autoSearch'
        },
        render: function() {
            this.$el.html(this.template({
                id: this.id + '-input',
                i18n: this.i18n,
                searchVal: this.picker.model.get('search')
            }));
        },
        doSearch: function() {
            var searchVal = this.$('.search').val();
            this.picker.model.set({
                search: searchVal
            });
            this.events.trigger('search', searchVal);
        },
        searchHandler: function(e) {
            // Looking for enter key in which case we immediately search
            var code = e.keyCode ? e.keyCode : e.which;
            if (code === 13) {
                if (this.submitTimeout) {
                    clearTimeout(this.submitTimeout);
                }
                this.doSearch();
                e.preventDefault();
            }
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
