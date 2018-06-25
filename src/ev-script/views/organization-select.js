define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/organization-select.html')),
        optionsTemplate: _.template(require('text!ev-script/templates/options.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render');
            this.picker = options.picker;
            this.$el.html(this.template({
                id: this.id + '-select',
                i18n: this.i18n
            }));
            this.$select = this.$('select');
            this.$select.html('<option value="-1">' + this.i18n.formatMessage('Loading...') + '</option>');
            this.collection.on('reset', this.render);
        },
        render: function() {
            var selectedId = this.picker.model.get('organizationId') || this.auth.getUser().get('defaultOrganizationId');
            this.$select.html(this.optionsTemplate({
                selectedId: selectedId,
                collection: this.collection
            }));
            this.$select.trigger('change');
        }
    });

});
