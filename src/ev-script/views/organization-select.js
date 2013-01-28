/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render');
            this.picker = options.picker;
            this.$el.html('<option value="-1">Loading...</option>');
            this.collection.bind('reset', this.render);
        },
        render: function() {
            this.$el.html('');
            this.collection.each(function(org) {
                var selected = (this.picker.model.get('organizationId') === org.id ? 'selected="selected"' : '');
                this.$el.append('<option value="' + org.id + '" ' + selected + '>' + org.get('Name') + '</option>');
            }, this);
            this.$el.trigger('change');
        }
    });

});
