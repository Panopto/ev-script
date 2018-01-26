define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    require('jquery-ui/ui/widgets/dialog');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'show', 'cancelHandler', 'submitHandler', 'checkboxHandler');
            this.field = options.field;
        },
        events: {
            'submit': 'submitHandler',
            'click .action-cancel': 'cancelHandler',
            'click input[type="checkbox"]': 'checkboxHandler'
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
        updateModel: function() {},
        checkboxHandler: function(e) {}
    });

});
