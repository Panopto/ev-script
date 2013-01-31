/*global define*/
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
        template: _.template(require('text!ev-script/templates/playlist-select.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization', 'changeLibrary', 'handleSubmit');
            this.picker = options.picker;
            this.id = options.id;
            var orgSelectId = this.id + '-org-select';
            var libSelectId = this.id + '-lib-select';
            this.$el.html(this.template({
                orgSelectId: orgSelectId,
                libSelectId: libSelectId
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
            var $loader = this.$('div.loader');
            $loader.bind('ajaxSend', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.addClass('loading');
                }
            }, this)).bind('ajaxComplete', _.bind(function(e, xhr, settings) {
                if (this.picker === settings.picker) {
                    $loader.removeClass('loading');
                }
            }, this));
        },
        events: {
            'change select.organizations': 'changeOrganization',
            'change select.libraries': 'changeLibrary',
            'submit form': 'handleSubmit'
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
            this.picker.loadPlaylists();
        },
        handleSubmit: function(e) {
            this.picker.loadPlaylists();
            e.preventDefault();
        },
        loadOrgs: function() {
            var orgs = this.getCachedOrgs(this.getUser());
            if (!orgs) {
                orgs = new Organizations({}, {
                    appId: this.appId
                });
                orgs.fetch({
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        this.setCachedOrgs(this.getUser(), collection);
                        this.orgSelect.collection.reset(collection.models);
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.ajaxError(xhr, _.bind(function() {
                            this.loadOrgs();
                        }, this));
                    }, this)
                });
            } else {
                this.orgSelect.collection.reset(orgs.models);
            }
        },
        loadLibraries: function() {
            var orgId = this.picker.model.get('organizationId');
            var libs = this.getCachedLibs(this.getUser(), orgId);
            if (!libs) {
                libs = new Libraries({}, {
                    organizationId: orgId,
                    appId: this.appId
                });
                libs.fetch({
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        this.setCachedLibs(this.getUser(), orgId, collection);
                        this.libSelect.collection.reset(collection.models);
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.ajaxError(xhr, _.bind(function() {
                            this.loadLibraries();
                        }, this));
                    }, this)
                });
            } else {
                this.libSelect.collection.reset(libs.models);
            }
        }
    });

});
