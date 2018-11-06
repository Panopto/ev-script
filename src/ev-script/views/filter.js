define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
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
                'showHome', 'hideHome',     'showUpload', 'hideUpload',
                'showRecord', 'hideRecord',     'setFocus', 'getLibrary',
                'goHome');

            this.picker = options.picker;
            this.id = options.id;

            this.$el.html(this.template({
                id: this.id,
                i18n: this.i18n
            }));

            var orgSelectOptions = {
                id: this.id + '-org-select',
                el: this.$('.ev-org-select'),
                collection: new BaseCollection(null, {}),
                noneOption: options.requireLibrarySelection ? null : {
                    name: '-- ' + this.i18n.formatMessage('All Organizations') + ' --',
                    value: ''
                }
            };
            this.orgSelect = new OrganizationSelectView(orgSelectOptions);

            var libSelectOptions = {
                id: this.id + '-lib-select',
                el: this.$('.ev-lib-select'),
                collection: new BaseCollection(null, {}),
                noneOption: options.requireLibrarySelection ? null : {
                    name: '-- ' + this.i18n.formatMessage('All Libraries') + ' --',
                    value: ''
                }
            };
            this.libSelect = new LibrarySelectView(libSelectOptions);

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

            log.debug('[views/filter] Filter initialized');
            log.debug(this);
        },
        events: {
            'click a.action-home': 'goHome',
            'change select.organizations': 'changeOrganization',
            'change select.libraries': 'changeLibrary'
        },
        goHome: function(e) {
            // Once the libraries are loaded, we can proceed to select the appropriate one
            this.$('select.libraries').one('change', _.bind(function() {
                this.libSelect.select(this.root.getUser().get('defaultLibraryId'));
            }, this));
            this.orgSelect.select(this.root.getUser().get('defaultOrganizationId'));
            e.preventDefault();
        },
        changeOrganization: function(e) {
            log.debug('[views/filter] changeOrganization');
            log.debug(arguments);
            this.picker.model.set({
                organizationId: e.target.value
            });
            this.loadLibraries();
        },
        changeLibrary: function(e) {
            log.debug('[views/filter] changeLibrary');
            log.debug(arguments);
            this.picker.model.set({
                libraryId: e.target.value
            });
            // If we're already in the user's "home" library, hide the home link
            if (this.picker.model.get('organizationId') === this.root.getUser().get('defaultOrganizationId') &&
                this.picker.model.get('libraryId') === this.root.getUser().get('defaultLibraryId')) {
                this.hideHome();
            } else {
                this.showHome();
            }
        },
        loadOrgs: function() {
            log.debug('[views/filter] loadOrgs');
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
            log.debug('[views/filter] loadLibraries');
            var orgId = this.picker.model.get('organizationId'),
                org = this.orgSelect.collection.findWhere({ 'id': orgId }),
                searchTemplate = org && new URITemplate(org.getLink('ev:Libraries/Search').href),
                searchUrl = searchTemplate && searchTemplate.expand({}),
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
            if (org) {
                this.libSelect.collection.reset(null, { silent: true });
                fetchLibs(searchUrl);
            } else {
                this.libSelect.collection.reset(null);
            }
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
        showHome: function() {
            this.$('.action-home').show();
        },
        hideHome: function() {
            this.$('.action-home').hide();
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
