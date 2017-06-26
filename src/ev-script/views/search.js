define(function(require) {

    'use strict';

    var _ = require('underscore'),
        messages = require('i18n!ev-script/nls/messages'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/search.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'searchHandler', 'doSearch', 'autoSearch');
            this.picker = options.picker;
            this.callback = options.callback || function() {};
        },
        events: {
            'keydown .search': 'searchHandler',
            'keyup .search': 'autoSearch'
        },
        render: function() {
            this.$el.html(this.template({
                messages: messages,
                id: this.id + '-input',
                searchVal: this.picker.model.get('search')
            }));
        },
        doSearch: function() {
            this.picker.model.set({
                search: this.$('.search').val()
            });
            this.callback();
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
