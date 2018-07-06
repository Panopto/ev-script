define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        BaseView = require('ev-script/views/base'),
        BaseCollection = require('ev-script/collections/base'),
        BaseModel = require('ev-script/models/base'),
        OrganizationSelectView = require('ev-script/views/organization-select'),
        Organizations = require('ev-script/models/organizations'),
        LibrarySelectView = require('ev-script/views/library-select'),
        Libraries = require('ev-script/models/libraries'),
        TypeSelectView = require('ev-script/views/library-type-select'),
        SearchView = require('ev-script/views/search');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/filter.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization',
                'changeLibrary', 'activateRecord', 'deactivateRecord',
                'showUpload', 'hideUpload', 'showRecord', 'hideRecord',
                'setFocus', 'getLibrary');

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
                collection: new BaseCollection(null, {})
            });

            this.libSelect = new LibrarySelectView({
                id: this.id + '-lib-select',
                el: this.$('.ev-lib-select'),
                picker: this.picker,
                collection: new BaseCollection(null, {})
            });

            if (options.showTypeSelect || _.isUndefined(options.showTypeSelect)) {
                this.typeSelectView = new TypeSelectView({
                    id: this.id + '-type-select',
                    el: this.$('.ev-type-select'),
                    picker: this.picker
                });
            }

            this.searchView = new SearchView({
                id: this.id + '-search',
                el: this.$('.ev-search'),
                picker: this.picker
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
            this.orgSelect.collection.reset(null, { silent: true });
            // In case root is loading...wait for it to finish
            this.root.promise.done(_.bind(function() {
                var searchTemplate = new URITemplate(this.root.getLink('ev:Organizations/Search').href),
                    searchUrl = searchTemplate.expand({}),
                    // Recursively load pages until we have all orgs.
                    fetchOrgs = _.bind(function(url) {
                        var orgs = new Organizations({}, {
                            href: url
                        });
                        orgs.fetch({
                            picker: this.picker,
                            success: _.bind(function(model, response, options) {
                                var next = model.getLink('next'),
                                    embeddedOrgs = model.getEmbedded('organizations');
                                if (embeddedOrgs) {
                                    this.orgSelect.collection.add(embeddedOrgs.models);
                                }
                                if (next) {
                                    fetchOrgs(next.href);
                                } else {
                                    // TODO - use events instead?
                                    this.orgSelect.collection.trigger('reset');
                                }
                            }, this),
                            error: _.bind(this.ajaxError, this)
                        });
                    }, this);
                fetchOrgs(searchUrl);
            }, this));
        },
        loadLibraries: function() {
            var orgId = this.picker.model.get('organizationId'),
                org = this.orgSelect.collection.findWhere({ 'id': orgId }),
                searchTemplate = new URITemplate(org.getLink('ev:Libraries/Search').href),
                searchUrl = searchTemplate.expand({}),
                // Recursively load pages until we have all libraries.
                fetchLibs = _.bind(function(url) {
                    var libs = new Libraries({}, {
                        href: url
                    });
                    libs.fetch({
                        picker: this.picker,
                        success: _.bind(function(model, response, options) {
                            var next = model.getLink('next'),
                                embeddedLibs = model.getEmbedded('libraries');
                            if (embeddedLibs) {
                                this.libSelect.collection.add(embeddedLibs.models);
                            }
                            if (next) {
                                fetchLibs(next.href);
                            } else {
                                // TODO - use events instead?
                                this.libSelect.collection.trigger('reset');
                            }
                        }, this),
                        error: _.bind(this.ajaxError, this)
                    });
                }, this);
            this.libSelect.collection.reset(null, { silent: true });
            fetchLibs(searchUrl);
        },
        getLibrary: function(id) {
            return this.libSelect.collection.findWhere({ 'id': id });
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
