/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'show', 'cancelHandler', 'submitHandler');
            this.field = options.field;
            this.app = options.app;
        },
        events: {
            'submit': 'submitHandler',
            'click input.action-cancel': 'cancelHandler'
        },
        show: function() {
            this.render();
            this.$el.dialog('open');
        },
        cancelHandler: function(e) {
            this.$el.dialog('close');
            e.preventDefault();
        },
        submitHandler: function(e) {
            this.updateModel();
            this.$el.dialog('close');
            e.preventDefault();
        },
        // Override me
        updateModel: function() {}
    });

});
