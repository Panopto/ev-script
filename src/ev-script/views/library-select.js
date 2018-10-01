define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/library-select.html')),
        optionsTemplate: _.template(require('text!ev-script/templates/options.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render', 'select');
            this.$el.html(this.template({
                id: this.id + '-select',
                i18n: this.i18n
            }));
            this.selectedId = options.selectedId;
            this.noneOption = options.noneOption;
            this.$select = this.$('select');
            this.$select.html('<option value="-1">' + this.i18n.formatMessage('Loading...') + '</option>');
            this.collection.on('reset', this.render);
        },
        render: function() {
            var singleItem = this.collection.length === 1;
            this.$select.html(this.optionsTemplate({
                noneOption: singleItem ? null : this.noneOption,
                selectedId: singleItem ? this.collection.at(0).get('id') : this.selectedId,
                collection: this.collection
            }));
            this.$select.trigger('change');
        },
        select: function(selectedId) {
            $('option[value="' + selectedId + '"]', this.$select).prop('selected', true);
            this.$select.trigger('change');
        }
    });

});
