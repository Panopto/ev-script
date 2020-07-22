define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
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
            'initCallback', 'loginHandler', 'handleLogin', 'toggleLoginMsg',
            '_init');

            this.$field = options.$field;
            this.$el.addClass('ev-field-wrap');
            this.showChoose = true;

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

            this.events.on('loggedOut', _.bind(function() {
                // Wait for our root to reload
                this.root.promise.done(_.bind(function() {
                    this.$('.action-remove').click();
                    this.toggleLoginMsg();
                }, this));
            }, this));

            this.events.on('loggedIn', _.bind(function() {
                this.toggleLoginMsg(true);
                this.handleLogin();
            }, this));

            this.events.on('localeReset', _.bind(function() {
                this.reloadField();
            }, this));

            this.handleLogin(true);
        },
        _init: function() {
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

            if (this.initialized) {
                this.events.trigger('fieldInitialized', this.id);
                log.debug('[views/field] Field already initialized');
                return;
            }

            this.initialized = true;

            this.renderActions();

            this.picker = this.getPickerInstance(pickerOptions);
            this.settings = this.getSettingsInstance(settingsOptions);
            this.$actions.after(this.picker.$el);

            this.events.trigger('fieldInitialized', this.id);

            log.debug('[views/field] Field initialized');
            log.debug(this);
        },
        destroy: function() {},
        reloadField: function() {
            log.debug('[views/field] Reloading field');
            this.$actions.remove();
            this.$actions = undefined;
            this.events.trigger('destroy', this);
            this.initialized = false;
            this.handleLogin();
        },
        events: {
            'click .ev-field .action-choose': 'chooseHandler',
            'click .ev-field .action-preview': 'previewHandler',
            'click .ev-field .action-options': 'optionsHandler',
            'click .ev-field .action-remove': 'removeHandler',
            'click .ev-field .login-link': 'loginHandler'
        },
        chooseHandler: function(e) {
            this.loginHandler(e);
        },
        optionsHandler: function(e) {
            if (this.settings) {
                this.settings.show();
            }
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
            this.events.trigger('fieldUpdated', this.$field);
            this.renderActions();
            e.preventDefault();
        },
        previewHandler: function(e) {
            var element = e.currentTarget;
            var previewView = this.getPreviewInstance({
                el: element,
                model: this.model,
                picker: this.picker
            });
            e.preventDefault();
        },
        loginHandler: function(e) {
            this.handleLogin(true);
            e.preventDefault();
        },
        toggleLoginMsg: function(off) {
            if (off) {
                this.$fieldMsg.hide();
            } else {
                this.$fieldMsg.show();
            }
        },
        handleLogin: function(attemptLogin) {
            this.root.promise.done(_.bind(function() {
                var user = this.root.getUser(),
                    prompt = user && this.config.currentUserId && this.config.currentUserId !== user.id;
                if (!user || prompt) {
                    this.renderActions();
                    this.toggleLoginMsg();
                    if (attemptLogin) {
                        this.auth.doAuthenticate(this.id, prompt);
                    }
                } else {
                    // Subclasses may need to prepare before we start instantiation of views
                    this.initCallback();
                    this._init();
                }
            }, this));
        },
        renderActions: function() {
            var ensembleUrl = this.config.ensembleUrl,
                label = this.getFieldLabel(),
                type = this.getFieldType();
            if (!this.$actions) {
                this.$actions = $('<div class="ev-field"/>');
                this.$field.after(this.$actions);
            }
            this.$actions.html(this.getActionsHtml({
                i18n: this.i18n,
                ensembleUrl: ensembleUrl, // TODO - how is this used?
                thumbnailUrl: false,
                modelId: this.model.id,
                displaySettings: this.settings,
                label: label,
                type: type,
                name: this.model.get('content') && this.model.get('content').name || ''
            }));

            this.$fieldMsg = this.$('.ev-field-message');
            this.$fieldMsg.html(this.i18n.formatMessage('You must {0}login{1} in order to use this tool.',
                '<a role="link" tabindex="0" class="login-link"><b>', '</b></a>'));

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
        itemChosenHandler: function(settingsModel) {
            if (settingsModel.get('type') === this.model.get('type')) {
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
