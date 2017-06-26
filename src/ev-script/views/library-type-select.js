define(function(require) {

    'use strict';

    var _ = require('underscore'),
        messages = require('i18n!ev-script/nls/messages'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/library-type-select.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'changeHandler');
            this.picker = options.picker;
            this.callback = options.callback || function() {};
        },
        events: {
            'change .source': 'changeHandler'
        },
        render: function() {
            this.$el.html(this.template({
                messages: messages,
                id: this.id + '-select',
                sourceId: this.picker.model.get('sourceId')
            }));
        },
        changeHandler: function(e) {
            this.picker.model.set({
                sourceId: this.$('.source').val()
            });
            this.callback();
            e.preventDefault();
        }
    });

});
