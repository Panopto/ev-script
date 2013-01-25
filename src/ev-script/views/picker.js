/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        HiderView = require('ev-script/views/hider');

    /*
     * Encapsulates views to manage search, display and selection of Ensemble videos and playlists.
     */
    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'chooseItem', 'hidePicker', 'showPicker', 'hideHandler');
            options.eventAggr.bind('hidePickers', this.hideHandler);
            this.$el.hide();
            this.auth = options.auth, this.cache = options.cache, this.config = options.config;
            this.field = options.field;
            this.hider = new HiderView({
                id: this.id + '-hider',
                tagName: 'div',
                className: 'ev-hider',
                picker: this,
                eventAggr: options.eventAggr,
                auth: options.auth
            });
            this.$el.append(this.hider.$el);
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
            this.hidePicker();
            e.preventDefault();
        },
        hidePicker: function() {
            this.$el.fadeOut('fast');
        },
        showPicker: function() {
            // In case our authentication status has changed...re-render our hider
            this.hider.render();
            this.$el.fadeIn('fast');
        },
        hideHandler: function(picker) {
            if(!picker || (this !== picker)) {
                this.hidePicker();
            }
        }
    });

});