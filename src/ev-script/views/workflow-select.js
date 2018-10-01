
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/options.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render');
            this.$el.html('<option value="-1">' + this.i18n.formatMessage('Loading...') + '</option>');
            this.render();
        },
        render: function() {
            var selected = this.collection.findWhere({
                'IsDefault': true
            }) || this.collection.at(0);
            this.$el.html(this.template({
                selectedId: selected.id,
                collection: this.collection,
                noneOption: null
            }));
        },
        getSelected: function() {
            return this.collection.get(this.$('option:selected').val());
        }
    });

});
