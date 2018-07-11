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
        template: _.template(require('text!ev-script/templates/picker.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            _.bindAll(this, 'chooseItem', 'hidePicker', 'showPicker');

            this.$el.hide();
            this.$el.html(this.template({
                id: this.id
            }));
            this.field = options.field;
            this.hider = new HiderView({
                el: this.$('div.ev-hider'),
                field: this.field
            });
            this.events.on('hidePickers', function(fieldId) {
                if (!fieldId || (this.field.id !== fieldId)) {
                    this.hidePicker();
                }
            }, this);
            this.events.on('showPicker', function(fieldId) {
                if (this.field.id === fieldId && this.$el.is(':hidden')) {
                    this.showPicker();
                }
            }, this);
            this.events.on('hidePicker', function(fieldId) {
                if (this.field.id === fieldId) {
                    this.hidePicker();
                }
            }, this);
            this.hider.render();
        },
        chooseItem: function(e) {
            var id = $(e.currentTarget).attr('rel'),
                chosenItem = this.resultsView.collection.get(id);
            this.model.set({
                id: chosenItem.get('id'),
                content: chosenItem.toJSON()
            });
            this.events.trigger('itemChosen', this.model, chosenItem);
            this.events.trigger('hidePicker', this.field.id);
            e.preventDefault();
        },
        hidePicker: function() {
            this.$el.hide();
        },
        showPicker: function() {
            // In case our authentication status has changed...re-render our hider
            this.hider.render();
            this.$el.show();
        }
    });

});
