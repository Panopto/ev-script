define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        OrganizationSelectView = require('ev-script/views/organization-select'),
        Organizations = require('ev-script/collections/organizations'),
        LibrarySelectView = require('ev-script/views/library-select'),
        Libraries = require('ev-script/collections/libraries');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/unit-selects.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization', 'changeLibrary');
            this.picker = options.picker;
            this.id = options.id;
            this.$el.html(this.template({
                formId: this.id + '-unit-selects',
                orgSelectId: this.id + '-org-select',
                libSelectId: this.id + '-lib-select'
            }));
            this.orgSelect = new OrganizationSelectView({
                el: this.$('.organizations'),
                picker: this.picker,
                appId: this.appId,
                collection: new Organizations({}, {
                    appId: this.appId
                })
            });
            this.libSelect = new LibrarySelectView({
                el: this.$('.libraries'),
                picker: this.picker,
                appId: this.appId,
                collection: new Libraries({}, {
                    appId: this.appId
                })
            });
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
        }
    });

});
