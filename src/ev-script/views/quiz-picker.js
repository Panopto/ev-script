define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        PickerView = require('ev-script/views/picker'),
        FilterView = require('ev-script/views/filter'),
        QuizResultsView = require('ev-script/views/quiz-results'),
        Quizzes = require('ev-script/models/quizzes');

    return PickerView.extend({
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);

            _.bindAll(this, 'loadQuizzes', 'changeLibrary', 'handleSubmit',
            'handleSearch', 'getSettingsModelAttributes');

            this.events
            .off('search', this.handleSearch)
            .on('search', this.handleSearch);

            var reload = _.bind(function(target) {
                if (target === 'quizzes') {
                    this.loadQuizzes();
                }
            }, this);
            this.events
            .off('reload', reload)
            .on('reload', reload);

            this.filter = new FilterView({
                id: this.id + '-filter',
                el: this.$('.ev-filter-block'),
                picker: this,
                showTypeSelect: false
            });

            this.resultsView = new QuizResultsView({
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
            this.loadQuizzes();
        },
        handleSubmit: function(e) {
            this.loadQuizzes();
            e.preventDefault();
        },
        handleSearch: function(model) {
            if (model === this.model) {
                this.loadQuizzes();
            }
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.filter.loadOrgs();
            this.filter.setFocus();
        },
        loadQuizzes: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                libraryId = this.model.get('libraryId'),
                library = this.filter.getLibrary(libraryId),
                searchTemplate = new URITemplate(library.getLink('ev:Quizzes/Search').href),
                searchUrl = searchTemplate.expand({
                    search: searchVal,
                    isArchived: false,
                    sortBy: 'createdOn',
                    desc: true,
                    pageSize: 20
                }),
                quizzes = new Quizzes({}, {
                    href: searchUrl
                });
            quizzes.fetch({
                picker: this,
                success: _.bind(function(model, response, options) {
                    this.resultsView.model = model;
                    this.resultsView.collection = model.getEmbedded('quizzes');
                    this.resultsView.render();
                }, this),
                error: _.bind(this.ajaxError, this)
            });
        },
        getSettingsModelAttributes: function(chosenItem) {
            return _.extend(PickerView.prototype.getSettingsModelAttributes.call(this, chosenItem), {
                contentId: chosenItem.get('referenceId')
            });
        }
    });

});
