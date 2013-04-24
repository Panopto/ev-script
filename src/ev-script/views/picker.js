define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        HiderView = require('ev-script/views/hider');

    /*
     * Encapsulates views to manage search, display and selection of Ensemble videos and playlists.
     */
    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'chooseItem', 'hidePicker', 'showPicker');
            this.$el.hide();
            this.field = options.field;
            this.hider = new HiderView({
                id: this.id + '-hider',
                tagName: 'div',
                className: 'ev-hider',
                field: this.field,
                appId: this.appId
            });
            this.$el.append(this.hider.$el);
            this.appEvents.on('hidePickers', function(fieldId) {
                if (!fieldId || (this.field.id !== fieldId)) {
                    this.hidePicker();
                }
            }, this);
            this.appEvents.on('showPicker', function(fieldId) {
                if (this.field.id === fieldId && this.$el.is(':hidden')) {
                    this.showPicker();
                }
            }, this);
            this.appEvents.on('hidePicker', function(fieldId) {
                if (this.field.id === fieldId) {
                    this.hidePicker();
                }
            }, this);
            this.hider.render();
        },
        events: {
            'click a.action-add': 'chooseItem'
        },
        chooseItem: function(e) {
            var id = $(e.target).attr('rel');
            var content = this.resultsView.collection.get(id);
            this.model.set({
                id: id,
                content: content.toJSON()
            });
            this.field.model.set(this.model.attributes);
            this.appEvents.trigger('hidePicker', this.field.id);
            e.preventDefault();
        },
        hidePicker: function() {
            this.$el.fadeOut('fast');
        },
        showPicker: function() {
            // In case our authentication status has changed...re-render our hider
            this.hider.render();
            this.$el.fadeIn('fast');
        }
    });

});
