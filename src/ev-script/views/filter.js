define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        URITemplate = require('urijs/URITemplate'),
        BaseView = require('ev-script/views/base'),
        BaseCollection = require('ev-script/collections/base'),
        Organizations = require('ev-script/models/organizations'),
        Libraries = require('ev-script/models/libraries'),
        SearchView = require('ev-script/views/search'),
        hapiAdapter = require('ev-script/util/hapiAdapter');

    require('select2/select2/compat/containerCss');
    require('select2/select2/compat/dropdownCss');
    require('select2/jquery.select2');
    require('select2/select2/i18n/en');
    require('select2/select2/i18n/es');
    require('select2/select2/i18n/fr');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/filter.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadOrgs', 'loadLibraries', 'changeOrganization',
                'changeLibrary', 'changeSource', 'activateRecord',
                'deactivateRecord', 'showHome', 'hideHome', 'showUpload',
                'hideUpload', 'showRecord', 'hideRecord', 'setFocus',
                'getLibrary', 'goHome');

            this.picker = options.picker;
            this.id = options.id;

            this.language = this.i18n.cldr.locale.split('-')[0];

            this.$el.html(this.template({
                id: this.id,
                i18n: this.i18n,
                sourceId: this.picker.model.get('sourceId')
            }));

            this.requireSelection = options.requireLibrarySelection;

            if (options.showTypeSelect || _.isUndefined(options.showTypeSelect)) {
                this.$('.ev-type-select').show();
            }

            this.searchView = new SearchView({
                id: this.id + '-search',
                el: this.$('.ev-search'),
                picker: this.picker
            });

            this.orgCollection = new BaseCollection(null, {});
            this.orgCollection.comparator = 'name';
            this.libCollection = new BaseCollection(null, {});
            this.libCollection.comparator = 'name';

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
            'change select.libraries': 'changeLibrary',
            'change select.source': 'changeSource'
        },
        goHome: function(e) {
            this.$orgSelect.trigger('hapi:useGet');
            this.$libSelect.trigger('hapi:useGet');
            this.orgCollection.reset(null);
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
        changeSource: function(e) {
            log.debug('[views/filter] changeLibrary');
            log.debug(arguments);

            var sourceVal = this.$('.source').val();
            this.picker.model.set({
                sourceId: sourceVal
            });

            this.events.trigger('typeSelectChange', sourceVal);
            e.preventDefault();
        },
        loadOrgs: function() {
            log.debug('[views/filter] loadOrgs');

            // In case root is loading...wait for it to finish
            this.root.promise.done(_.bind(function() {
                var searchTemplate = new URITemplate(this.root.getLink('ev:Organizations/Search').href);

                if (!this.$orgSelect) {
                    this.$orgSelect = this.$('.organizations').select2({
                        dataAdapter: hapiAdapter,
                        width: 'style',
                        containerCssClass: 'ui-widget',
                        dropdownCssClass: 'ui-widget',
                        language: this.language,
                        hapi: {
                            collection: this.orgCollection,
                            collectionName: 'organizations',
                            templates: {
                                search: new URITemplate(this.root.getLink('ev:Organizations/Search').href),
                                get: new URITemplate(this.root.getLink('ev:Organizations/Get').href)
                            },
                            useGet: true,
                            modelClass: Organizations,
                            picker: this.picker,
                            ajaxError: this.ajaxError,
                            noneOption: this.requireSelection ? null : {
                                id: '',
                                text: '-- ' + this.i18n.formatMessage('All Organizations') + ' --'
                            },
                            defaultId: this.root.getUser().get('defaultOrganizationId')
                        }
                    });
                }
            }, this));
        },
        loadLibraries: function() {
            log.debug('[views/filter] loadLibraries');
            var orgId = this.picker.model.get('organizationId'),
                org = this.orgCollection.findWhere({ 'id': orgId }),
                getTemplate = new URITemplate(this.root.getLink('ev:Libraries/Get').href),
                searchTemplate = new URITemplate(org ?
                    org.getLink('ev:Libraries/Search').href :
                    this.root.getLink('ev:Libraries/Search').href);

            if (!this.$libSelect) {
                this.$libSelect = this.$('.libraries').select2({
                    dataAdapter: hapiAdapter,
                    width: 'style',
                    containerCssClass: 'ui-widget',
                    dropdownCssClass: 'ui-widget',
                    language: this.language,
                    hapi: {
                        collection: this.libCollection,
                        collectionName: 'libraries',
                        templates: {
                            search: searchTemplate,
                            get: getTemplate
                        },
                        useGet: true,
                        modelClass: Libraries,
                        picker: this.picker,
                        ajaxError: this.ajaxError,
                        noneOption: this.requireSelection ? null : {
                            id: '',
                            text: '-- ' + this.i18n.formatMessage('All Libraries') + ' --'
                        },
                        defaultId: this.root.getUser().get('defaultLibraryId')
                    }
                });
            } else {
                this.$libSelect.trigger('hapi:updateTemplates', [
                    {
                        search: searchTemplate,
                        get: getTemplate
                    }
                ]);
                this.libCollection.reset(null);
            }
        },
        getLibrary: function(id) {
            return this.libCollection.findWhere({ 'id': id });
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
