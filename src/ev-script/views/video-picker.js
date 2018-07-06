define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        platform = require('platform'),
        URITemplate = require('urijs/URITemplate'),
        PickerView = require('ev-script/views/picker'),
        FilterView = require('ev-script/views/filter'),
        VideoResultsView = require('ev-script/views/video-results'),
        Videos = require('ev-script/models/videos'),
        MediaWorkflows = require('ev-script/collections/media-workflows'),
        UploadView = require('ev-script/views/upload');

    require('base64');

    return PickerView.extend({
        anthemTemplate: _.template(require('text!ev-script/templates/anthem.html')),
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadVideos', 'loadWorkflows', 'changeLibrary', 'handleSubmit', 'uploadHandler', 'recordHandler');

            this.events.on('typeSelectChange', this.loadVideos);
            this.events.on('search', this.loadVideos);
            this.events.on('fileUploaded', this.loadVideos);
            this.events.on('reload', _.bind(function(target) {
                if (target === 'videos') {
                    this.loadVideos();
                }
            }, this));

            this.filter = new FilterView({
                id: this.id + '-filter',
                el: this.$('.ev-filter-block'),
                picker: this
            });

            this.resultsView = new VideoResultsView({
                el: this.$('.ev-results'),
                picker: this
            });

            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click .action-add': 'chooseItem',
            'click .action-upload': 'uploadHandler',
            'click .action-record': 'recordHandler',
            'change .ev-filter-block select.libraries': 'changeLibrary',
            'submit .ev-filter-block': 'handleSubmit'
        },
        changeLibrary: function(e) {
            this.loadVideos();
            this.loadWorkflows();
        },
        handleSubmit: function(e) {
            this.loadVideos();
            e.preventDefault();
        },
        uploadHandler: function(e) {
            var uploadView = new UploadView({
                field: this.field,
                workflows: this.workflows
            });
            e.preventDefault();
        },
        recordHandler: function(e) {
            var pollingId,
                timeoutId,
                activate = _.bind(function() {
                    this.anthemLaunching = true;
                    this.filter.activateRecord();
                }, this),
                deactivate = _.bind(function() {
                    this.anthemLaunching = false;
                    this.filter.deactivateRecord();
                    if (pollingId) {
                        clearInterval(pollingId);
                    }
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                }, this);

            if (this.anthemLaunching) {
                e.preventDefault();
                return false;
            }

            activate();

            $.ajax({
                url: this.config.ensembleUrl + '/api/record/token/CreateToken',
                data: {
                    'libraryId': this.model.get('libraryId')
                },
                xhrFields: {
                    withCredentials: true
                }
            }).done(_.bind(function(newToken) {
                if (newToken && newToken !== '00000000-0000-0000-0000-000000000000') {
                    this.$('#anthemContainer').html(this.anthemTemplate({
                        tokenDetailsApiUrl: window.btoa(this.config.ensembleUrl + '/api/record/token/GetDetails?token=' + newToken)
                    }));

                    pollingId = setInterval(_.bind(function() {
                        $.ajax({
                            url: this.config.ensembleUrl + '/api/record/token/IsActive',
                            xhrFields: {
                                withCredentials: true
                            },
                            data: {
                                'token': newToken
                            }
                        }).done(function(activeStatus) {
                            if (!activeStatus) {
                                deactivate();
                            }
                        }).fail(function() {
                            deactivate();
                        });
                    }, this), 5000);

                    // If launch hasn't deactivated in 30 secs, we probably need to install
                    timeoutId = setTimeout(_.bind(function() {
                        deactivate();
                        if (/windows/i.test(platform.os.family)) {
                            window.location = this.config.ensembleUrl + '/app/unprotected/EnsembleAnthem/EnsembleAnthem.msi';
                        } else {
                            window.location = this.config.ensembleUrl + '/app/unprotected/EnsembleAnthem/EnsembleAnthem.dmg';
                        }
                    }, this), 30000);
                } else {
                    deactivate();
                }
            }, this)).fail(deactivate);
            e.preventDefault();
        },
        showPicker: function() {
            PickerView.prototype.showPicker.call(this);
            this.filter.loadOrgs();
            this.filter.setFocus();
        },
        loadVideos: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                sourceId = this.model.get('sourceId'),
                libraryId = this.model.get('libraryId'),
                library = this.filter.getLibrary(libraryId),
                searchTemplate = sourceId === 'shared' ?
                    new URITemplate(library.getLink('ev:SharedContents/Search').href) :
                    new URITemplate(library.getLink('ev:Contents/Search').href),
                searchUrl = searchTemplate.expand({
                    status: 'unknown,ready,file_ready',
                    search: searchVal,
                    sortBy: 'dateAdded',
                    isPublished: true,
                    desc: true
                }),
                videos = new Videos({}, {
                    href: searchUrl
                });

            videos.fetch({
                picker: this,
                success: _.bind(function(model, response, options) {
                    this.resultsView.model = model;
                    this.resultsView.collection = model.getEmbedded(sourceId === 'shared' ? 'sharedContents' : 'contents');
                    this.resultsView.render();
                }, this),
                error: _.bind(this.ajaxError, this)
            });
        },
        loadWorkflows: function() {
            this.workflows = new MediaWorkflows({}, {});
            // FIXME - add libraryId (as with playlists)
            this.workflows.filterValue = this.model.get('libraryId');
            this.workflows.fetch({
                cacheKey: this.workflows.filterValue,
                success: _.bind(function(collection, response, options) {
                    if (!collection.isEmpty()) {
                        this.filter.showUpload();
                        if (this.canRecord()) {
                            this.filter.showRecord();
                        }
                    } else {
                        this.filter.hideUpload();
                        this.filter.hideRecord();
                    }
                }, this),
                error: _.bind(this.ajaxError, this),
                reset: true
            });
        },
        canRecord: function() {
            var currentUser = this.root.getUser();
            return currentUser && currentUser.get('CanUseAnthem') && !this.isMobile() && platform.os.family !== 'Linux';
        },
        isMobile: function() {
            var family = platform.os.family;
            return family === 'Android' || family === 'iOS' || family === 'Windows Phone';
        }
    });

});
