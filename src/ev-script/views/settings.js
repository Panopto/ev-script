define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    require('jquery-ui/ui/widgets/dialog');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'show', 'cancelHandler', 'submitHandler', 'checkboxHandler', 'typeHandler');
            this.field = options.field;
        },
        events: {
            'submit': 'submitHandler',
            'click .action-cancel': 'cancelHandler',
            'click input[type="checkbox"]': 'checkboxHandler',
            'change select.embedtype': 'typeHandler'
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
        typeHandler: function(e) {
            var $sizeWrap = this.$('.sizeWrap'),
                type = e.currentTarget.value;
            if (type === 'fixed' && $sizeWrap.length) {
                $sizeWrap.show();
            } else if (type === 'responsive' && $sizeWrap.length) {
                $sizeWrap.hide();
            }
        },
        // Override me
        updateModel: function() {},
        checkboxHandler: function(e) {}
    });

});
