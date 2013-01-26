/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        OrganizationSelectView = require('ev-script/views/organization-select'),
        Organizations = require('ev-script/collections/organizations'),
        LibrarySelectView = require('ev-script/views/library-select'),
        Libraries = require('ev-script/collections/libraries');

    return Backbone.View.extend({
        initialize: function(options) {
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization', 'changeLibrary', 'handleSubmit');
            this.picker = options.picker;
            this.id = options.id;
            this.app = options.app;
            var orgSelectId = this.id + '-org-select';
            this.$el.append('<label for="' + orgSelectId + '">Organization:</label>');
            this.orgSelect = new OrganizationSelectView({
                id: orgSelectId,
                tagName: 'select',
                className: 'form-select organizations',
                picker: this.picker,
                app: this.app,
                collection: new Organizations({}, {
                    app: this.app
                })
            });
            this.$el.append(this.orgSelect.$el);
            var libSelectId = this.id + '-lib-select';
            this.$el.append('<label for="' + libSelectId + '">Library:</label>');
            this.libSelect = new LibrarySelectView({
                id: libSelectId,
                tagName: 'select',
                className: 'form-select libraries',
                picker: this.picker,
                app: this.app,
                collection: new Libraries({}, {
                    app: this.app
                })
            });
            this.$el.append(this.libSelect.$el);
            var html = '<input type="button" value="Go" class="form-submit" />' + '<div class="loader"></div>' + '<div class="ev-poweredby"><a tabindex="-1" target="_blank" href="http://ensemblevideo.com"><span>Powered by Ensemble</span></a></div>';
            this.$el.append(html);
            var $loader = this.$('div.loader');
            $loader.bind('ajaxSend', _.bind(function(e, xhr, settings) {
                if(this.picker === settings.picker) {
                    $loader.addClass('loading');
                }
            }, this)).bind('ajaxComplete', _.bind(function(e, xhr, settings) {
                if(this.picker === settings.picker) {
                    $loader.removeClass('loading');
                }
            }, this));
        },
        events: {
            'change select.organizations': 'changeOrganization',
            'change select.libraries': 'changeLibrary',
            'click input.form-submit': 'handleSubmit'
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
            var orgs = this.app.cache.orgsCache[this.app.auth.getUser()];
            if(!orgs) {
                orgs = new Organizations({}, {
                    app: this.app
                });
                orgs.fetch({
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        this.app.cache.orgsCache[this.app.auth.getUser()] = collection;
                        this.orgSelect.collection.reset(collection.models);
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
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
            var libs = this.app.cache.libsCache[this.app.auth.getUser() + orgId];
            if(!libs) {
                libs = new Libraries({}, {
                    organizationId: orgId,
                    app: this.app
                });
                libs.fetch({
                    picker: this.picker,
                    success: _.bind(function(collection, response, options) {
                        this.app.cache.libsCache[this.app.auth.getUser() + orgId] = collection;
                        this.libSelect.collection.reset(collection.models);
                    }, this),
                    error: _.bind(function(collection, xhr, options) {
                        this.app.auth.ajaxError(xhr, _.bind(function() {
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
