/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'searchHandler', 'doSearch', 'autoSearch');
            this.picker = options.picker;
        },
        events: {
            'click input.form-submit': 'searchHandler',
            'change select.source': 'searchHandler',
            'keyup input.form-text': 'autoSearch'
        },
        render: function() {
            var id = this.id + '-input';
            var html =
                '<label for="' + id + '">Search Ensemble:</label>' +
                '<input id="' + id + '" type="text" class="form-text" value="' + this.picker.model.get('search') + '" />' +
                '<select class="form-select source">' +
                '  <option value="content" ' + (this.picker.model.get('sourceId') === 'content' ? 'selected="selected"' : '') + '>Media Library</option>' +
                '  <option value="shared" ' + (this.picker.model.get('sourceId') === 'shared' ? 'selected="selected"' : '') + '>Shared Library</option>' +
                '</select>' +
                '<input type="button" value="Go" class="form-submit" />' +
                '<div class="loader"></div>' +
                '<div class="ev-poweredby"><a tabindex="-1" target="_blank" href="http://ensemblevideo.com"><span>Powered by Ensemble</span></a></div>';
            this.$el.html(html);
            var $loader = this.$('div.loader');
            $loader.bind('ajaxSend', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.addClass('loading');
                }
            }, this)).bind('ajaxComplete', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.removeClass('loading');
                }
            }, this));
        },
        doSearch: function() {
            this.picker.model.set({
                search: this.$('input.form-text').val(),
                sourceId: this.$('select.source').val()
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
