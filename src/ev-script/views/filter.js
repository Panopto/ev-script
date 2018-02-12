define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        OrganizationSelectView = require('ev-script/views/organization-select'),
        Organizations = require('ev-script/collections/organizations'),
        LibrarySelectView = require('ev-script/views/library-select'),
        Libraries = require('ev-script/collections/libraries'),
        TypeSelectView = require('ev-script/views/library-type-select'),
        SearchView = require('ev-script/views/search');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/filter.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization',
                'changeLibrary', 'activateRecord', 'deactivateRecord',
                'showUpload', 'hideUpload', 'showRecord', 'hideRecord',
                'setFocus');

            this.picker = options.picker;
            this.id = options.id;

            this.$el.html(this.template({
                id: this.id,
                i18n: this.i18n
            }));

            this.orgSelect = new OrganizationSelectView({
                id: this.id + '-org-select',
                el: this.$('.ev-org-select'),
                picker: this.picker,
                appId: this.appId,
                collection: new Organizations({}, {
                    appId: this.appId
                })
            });

            this.libSelect = new LibrarySelectView({
                id: this.id + '-lib-select',
                el: this.$('.ev-lib-select'),
                picker: this.picker,
                appId: this.appId,
                collection: new Libraries({}, {
                    appId: this.appId
                })
            });

            if (options.showTypeSelect || _.isUndefined(options.showTypeSelect)) {
                this.typeSelectView = new TypeSelectView({
                    id: this.id + '-type-select',
                    el: this.$('.ev-type-select'),
                    picker: this.picker,
                    appId: this.appId
                });
            }

            this.searchView = new SearchView({
                id: this.id + '-search',
                el: this.$('.ev-search'),
                picker: this.picker,
                appId: this.appId
            });

            var $loader = this.$('div.loader');
            $(window.document).on('ajaxSend', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.addClass('loading');
                }
            }, this)).on('ajaxComplete', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.removeClass('loading');
                }
            }, this));
        },
        events: {
            'change select.organizations': 'changeOrganization',
            'change select.libraries': 'changeLibrary'
        },
        changeOrganization: function(e) {
            this.picker.model.set({
                organizationId: e.target.value
            });
            this.loadLibraries();
        },
        changeLibrary: function(e) {
            this.picker.model.set({
                libraryId: e.target.value
            });
        },
        loadOrgs: function() {
            var orgs = new Organizations({}, {
                appId: this.appId
            });
            orgs.fetch({
                picker: this.picker,
                success: _.bind(function(collection, response, options) {
                    this.orgSelect.collection.reset(collection.models);
                }, this),
                error: _.bind(function(collection, xhr, options) {
                    this.ajaxError(xhr, _.bind(function() {
                        this.loadOrgs();
                    }, this));
                }, this)
            });
        },
        loadLibraries: function() {
            var orgId = this.picker.model.get('organizationId');
            var libs = new Libraries({}, {
                organizationId: orgId,
                appId: this.appId
            });
            libs.fetch({
                picker: this.picker,
                cacheKey: orgId,
                success: _.bind(function(collection, response, options) {
                    this.libSelect.collection.reset(collection.models);
                }, this),
                error: _.bind(function(collection, xhr, options) {
                    this.ajaxError(xhr, _.bind(function() {
                        this.loadLibraries();
                    }, this));
                }, this)
            });
        },
        activateRecord: function() {
            this.$('.record-active').show();
            this.$('.record-inactive').hide();
        },
        deactivateRecord: function() {
            this.$('.record-active').hide();
            this.$('.record-inactive').show();
        },
        showUpload: function() {
            this.$('.action-upload').show();
        },
        hideUpload: function() {
            this.$('.action-upload').hide();
        },
        showRecord: function() {
            this.$('.action-record').show();
        },
        hideRecord: function() {
            this.$('.action-record').hide();
        },
        setFocus: function() {
            this.$('select').filter(':visible').first().focus();
        }
    });

});
