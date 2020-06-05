define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        PickerView = require('ev-script/views/picker'),
        FilterView = require('ev-script/views/filter'),
        PlaylistResultsView = require('ev-script/views/playlist-results'),
        Playlists = require('ev-script/models/playlists');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);

            _.bindAll(this, 'loadPlaylists', 'changeLibrary', 'handleSubmit',
            'handleSearch');

            this.events
            .off('search', this.handleSearch)
            .on('search', this.handleSearch);

            var reload = _.bind(function(target) {
                if (target === 'playlists') {
                    this.loadPlaylists();
                }
            }, this);
            this.events
            .off('reload', reload)
            .on('reload', reload);

            // TODO - handle callback
            this.filter = new FilterView({
                id: this.id + '-filter',
                el: this.$('.ev-filter-block'),
                picker: this,
                showTypeSelect: false
            });

            this.resultsView = new PlaylistResultsView({
                el: this.$('div.ev-results'),
                picker: this
            });

            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click a.action-add': 'chooseItem',
            'change .ev-filter-block select.libraries': 'changeLibrary',
            'submit .ev-filter-block': 'handleSubmit'
        },
        changeLibrary: function(e) {
            this.loadPlaylists();
        },
        handleSubmit: function(e) {
            this.loadPlaylists();
            e.preventDefault();
        },
        handleSearch: function(model) {
            if (model === this.model) {
                this.loadPlaylists();
            }
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.filter.loadOrgs();
            this.filter.setFocus();
        },
        loadPlaylists: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                searchTemplate = new URITemplate(this.root.getLink('ev:Playlists/Search').href),
                searchUrl = searchTemplate.expand({
                    organizationId: this.model.get('organizationId'),
                    libraryId: this.model.get('libraryId'),
                    search: searchVal,
                    sortBy: 'title',
                    pageSize: 20
                }),
                playlists = new Playlists({}, {
                    href: searchUrl
                });

            this.filter.disable();
            playlists.fetch({
                picker: this,
                success: _.bind(function(model, response, options) {
                    this.resultsView.model = model;
                    this.resultsView.collection = model.getEmbedded('playlists');
                    this.resultsView.render();
                }, this),
                error: _.bind(this.ajaxError, this)
            })
            .always(_.bind(function() {
                this.filter.enable();
            }, this));
        },
        getSettingsModelAttributes: function(chosenItem) {
            var defaultLayout = chosenItem.get('defaultLayout').replace(/^\w/, function (chr) {
                    return chr.toLowerCase();
                }),
                elementId = 'pl-wrapper-' + chosenItem.get('id'),
                width,
                height,
                wrapstyle,
                wrapscript;

            switch (defaultLayout) {
                case 'list':
                case 'grid':
                    width = 800;
                    height = 590;
                    wrapstyle = 'position: relative; padding-bottom: 56.25%; padding-top: 132px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = 'function handleResize() { var e = document.getElementById("' + elementId + '"); if (null != e) { var i = e.getElementsByTagName("iframe")[0]; if (null != i) { e.style = "width: 100%; height: 100%;"; i.style = "width: 100%; height: 100%;"; var n = e.offsetWidth; e.style.height = n >= 400 ? 56.25 * n / 100 + 140 + "px" : 56.25 * n / 100 + 390 + "px" }}} handleResize(), window.onresize = function (e) { handleResize() };';
                    break;
                case 'listWithPlayer':
                case 'gridWithPlayer':
                    width = 700;
                    height = 750;
                    wrapstyle = 'position: relative; padding-bottom: 56.25%; padding-top: 400px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = '';
                    break;
                case 'verticalListWithPlayer':
                    width = 1000;
                    height = 390;
                    wrapstyle = 'position: relative; padding-bottom: 39%; padding-top: 0px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = 'function handleResize() { var e = document.getElementById("' + elementId + '"); if (null != e) { var i = e.getElementsByTagName("iframe")[0]; if (null != i) { e.style = "width: 100%; height: 100%;"; i.style = "width: 100%; height: 100%;"; var n = e.offsetWidth; e.style.height = n >= 822 ? 66.6 * n / 100 * .5625 + 15 + "px" : .5625 * n + 350 + "px" }}} handleResize(), window.onresize = function (e) { handleResize() };';
                    break;
                case 'horizontalListWithPlayer':
                    width = 800;
                    height = 700;
                    wrapstyle = 'position: relative; padding-bottom: 56.25%; padding-top: 300px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = '';
                    break;
                case 'showcase':
                    width = 1000;
                    height = 590;
                    wrapstyle = 'position: relative; padding-bottom: 39%; padding-top: 300px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = 'function handleResize() { var e = document.getElementById("' + elementId + '"); if (null != e) { var i = e.getElementsByTagName("iframe")[0]; if (null != i) { e.style = "width: 100%; height: 100%;"; i.style = "width: 100%; height: 100%;"; var n = e.offsetWidth; e.style.height = n >= 822 ? 66.6 * n / 100 * .5625 + 300 + "px" : 66.6 * n / 100 * .5625 + 500 + "px" }}} handleResize(), window.onresize = function (e) { handleResize() };';
                    break;
                case 'horizontalList':
                    width = 1000;
                    height = 250;
                    wrapstyle = 'position: relative; padding-bottom: 0; padding-top: 300px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = '';
                    break;
                case 'loop':
                    width = 800;
                    height = 455;
                    wrapstyle = 'position: relative; padding-bottom: 56.25%; padding-top: 10px; height: 0; overflow: auto; -webkit-overflow-scrolling: touch;';
                    wrapscript = '';
                    break;
            }

            return _.extend(PickerView.prototype.getSettingsModelAttributes.call(this, chosenItem), {
                layout: defaultLayout,
                width: width,
                height: height,
                wrapstyle: wrapstyle,
                wrapscript: wrapscript,
                featuredcontentid: chosenItem.get('featuredContentId')
            });
        }
    });

});
