define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/library-type-select.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'changeHandler');
            this.picker = options.picker;
            this.render();
        },
        events: {
            'change .source': 'changeHandler'
        },
        render: function() {
            this.$el.html(this.template({
                id: this.id + '-select',
                i18n: this.i18n,
                sourceId: this.picker.model.get('sourceId')
            }));
        },
        changeHandler: function(e) {
            var sourceVal = this.$('.source').val();
            this.picker.model.set({
                sourceId: sourceVal
            });
            this.appEvents.trigger('typeSelectChange', sourceVal);
            e.preventDefault();
        }
    });

});
