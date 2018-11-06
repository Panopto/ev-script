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

            // We use this to start at home/default library
            this.initialLoad = true;
            this.events.on('loggedIn', _.bind(function() {
                this.initialLoad = true;
            }, this));

            this.noneOption = options.noneOption;
            this.$select = this.$('select');
            this.$select.html('<option value="-1">' + this.i18n.formatMessage('Loading...') + '</option>');
            this.collection.on('reset', this.render);
        },
        render: function() {
            var singleItem = this.collection.length === 1;
            this.$select.html(this.optionsTemplate({
                noneOption: singleItem ? null : this.noneOption,
                selectedId: this.initialLoad ? this.root.getUser().get('defaultLibraryId') : '',
                collection: this.collection
            }));
            this.initialLoad = false;
            this.$select.trigger('change');
        },
        select: function(selectedId) {
            $('option[value="' + selectedId + '"]', this.$select).prop('selected', true);
            this.$select.trigger('change');
        }
    });

});
