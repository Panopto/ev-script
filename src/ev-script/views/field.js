define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        AuthView = require('ev-script/views/auth'),
        BaseView = require('ev-script/views/base');

    /*
     * Base view for our field (element that we set with the selected content metadata
     */
    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/field.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            _.bindAll(this, 'chooseHandler', 'optionsHandler', 'removeHandler',
            'previewHandler', 'getPickerInstance', 'getSettingsInstance',
            'getPreviewInstance', 'updateField', 'getFieldType',
            'getFieldLabel', 'itemChosenHandler', 'getActionsHtml',
            'initCallback', 'doAuthenticate');

            this.$field = options.$field;
            this.$el.addClass('ev-field-wrap');
            this.showChoose = true;

            var pickerOptions = {
                    id: this.id + '-picker',
                    tagName: 'div',
                    className: 'ev-' + this.model.get('type') + '-picker',
                    field: this
                },
                settingsOptions = {
                    id: this.id + '-settings',
                    tagName: 'div',
                    className: 'ev-settings',
                    field: this
                };

            // Subclasses may need to prepare before we start instantiation of views
            this.initCallback();

            this.events.on('showPicker', function(fieldId) {
                if (this.id === fieldId) {
                    this.$('.action-choose').hide();
                    this.showChoose = false;
                    // We only want one picker showing at a time so notify all fields to hide them (unless it's ours)
                    if (this.config.hidePickers) {
                        this.events.trigger('hidePickers', this.id);
                    }
                }
            }, this);
            this.events.on('hidePicker', function(fieldId) {
                if (this.id === fieldId) {
                    this.$('.action-choose').show();
                    this.showChoose = true;
                }
            }, this);
            this.events.on('hidePickers', function(fieldId) {
                // When the picker for our field is hidden we need need to show our 'Choose' button
                if (!fieldId || (this.id !== fieldId)) {
                    this.$('.action-choose').show();
                    this.showChoose = true;
                }
            }, this);
            this.events.on('itemChosen', this.itemChosenHandler);

            this.picker = this.getPickerInstance(pickerOptions);
            this.settings = this.getSettingsInstance(settingsOptions);
            this.$field.after(this.picker.$el);
            this.renderActions();

            // Authentication check
            this.doAuthenticate();
        },
        events: {
            'click .action-choose': 'chooseHandler',
            'click .action-preview': 'previewHandler',
            'click .action-options': 'optionsHandler',
            'click .action-remove': 'removeHandler'
        },
        doAuthenticate: function() {
            var deferred = $.Deferred();
            this.root.promise.always(_.bind(function() {
                if (!this.root.getUser()) {
                    var authView = new AuthView({
                        el: this.el,
                        submitCallback: _.bind(function() {
                            this.root.fetch().always(_.bind(function() {
                                this.events.trigger(!this.root.getUser() ? 'loggedOut' : 'loggedIn');
                            }, this));
                            deferred.resolve();
                        }, this),
                        auth: this
                    });
                    authView.render();
                } else {
                    deferred.resolve();
                }
            }, this));
            return deferred;
        },
        chooseHandler: function(e) {
            this.doAuthenticate().always(_.bind(function() {
                this.events.trigger('showPicker', this.id);
            }, this));
            e.preventDefault();
        },
        optionsHandler: function(e) {
            this.settings.show();
            e.preventDefault();
        },
        removeHandler: function(e) {
            this.model.clear();
            this.$field.val('');
            // Silent here because we don't want to trigger our change handler above
            // (which would set the field value to our model defaults)
            this.model.set(this.model.defaults, {
                silent: true
            });
            this.chosenItem = null;
            this.events.trigger('fieldUpdated', this.$field);
            this.renderActions();
            e.preventDefault();
        },
        previewHandler: function(e) {
            var element = e.currentTarget;
            var previewView = this.getPreviewInstance({
                el: element,
                model: this.model,
                selectedItem: this.chosenItem,
                picker: this.picker
            });
            e.preventDefault();
        },
        renderActions: function() {
            var ensembleUrl = this.config.ensembleUrl,
                label = this.getFieldLabel(),
                type = this.getFieldType(),
                name = this.model.id;
            if (!this.$actions) {
                this.$actions = $('<div class="ev-field"/>');
                this.$field.after(this.$actions);
            }
            this.$actions.html(this.getActionsHtml({
                i18n: this.i18n,
                // TODO - how is this used?
                ensembleUrl: ensembleUrl,
                thumbnailUrl: false,
                modelId: this.model.id,
                label: label,
                type: type,
                name: name
            }));
            // If our picker is shown, hide our 'Choose' button
            if (!this.showChoose) {
                this.$('.action-choose').hide();
            }
        },
        updateField: function() {
            var json = this.model.toJSON();
            this.$field.val(JSON.stringify(json));
            this.events.trigger('fieldUpdated', this.$field, json);
            this.renderActions();
        },
        itemChosenHandler: function(settingsModel, chosenItem) {
            if (settingsModel.get('type') === this.model.get('type')) {
                this.chosenItem = chosenItem;
                this.model.set(settingsModel.attributes);
            }
        },
        getActionsHtml: function(templateOptions) {
            return this.template(templateOptions);
        },
        // Subclasses must impl the following
        initCallback: function() {},
        getPickerInstance: function(pickerOptions) {},
        getSettingsInstance: function(settingsOptions) {},
        getPreviewInstance: function(previewOptions) {},
        getFieldType: function() {},
        getFieldLabel: function() {},
    });

});
