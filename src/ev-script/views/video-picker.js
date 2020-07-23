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
        SharedVideos = require('ev-script/models/shared-videos'),
        Libraries = require('ev-script/models/libraries'),
        Workflows = require('ev-script/models/workflows'),
        UploadView = require('ev-script/views/upload');

    require('base64');

    return PickerView.extend({
        anthemTemplate: _.template(require('text!ev-script/templates/anthem.html')),
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);

            _.bindAll(this, 'loadVideos', 'loadWorkflows', 'changeLibrary',
            'handleSubmit', 'uploadHandler', 'recordHandler', 'handleSearch',
            'isSharedContent', 'changeLibraryType', 'handleUploadVisibility');

            this.events
            .off('typeSelectChange', this.changeLibraryType)
            .on('typeSelectChange', this.changeLibraryType);

            this.events
            .off('search', this.handleSearch)
            .on('search', this.handleSearch);

            var reload = _.bind(function(target) {
                if (target === 'videos') {
                    this.loadVideos();
                }
            }, this);
            this.events
            .off('reload', reload)
            .on('reload', reload);

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
            var libraryId = this.model.get('libraryId');

            this.loadVideos();
            this.loadWorkflows();
            this.handleUploadVisibility();
        },
        changeLibraryType: function(e) {
            this.loadVideos();
            this.handleUploadVisibility();
        },
        handleSubmit: function(e) {
            this.loadVideos();
            e.preventDefault();
        },
        handleSearch: function(model) {
            if (model === this.model) {
                this.loadVideos();
            }
        },
        handleUploadVisibility: function() {
            var libraryId = this.model.get('libraryId'),
                library = this.filter.getLibrary(libraryId);

            if (!library ||
                !this.workflows ||
                !library.getLink('ev:Contents/Create')) {
                this.filter.hideUpload();
                this.filter.hideRecord();
                return;
            }

            this.workflows.promise.done(_.bind(function() {
                var workflows = this.workflows.getEmbedded(this.workflows.collectionKey);
                if (workflows && !workflows.isEmpty() && !this.isSharedContent()) {
                    this.filter.showUpload();
                    if (this.canRecord()) {
                        this.filter.showRecord();
                    }
                } else {
                    this.filter.hideUpload();
                    this.filter.hideRecord();
                }
            }, this));
        },
        uploadHandler: function(e) {
            var libraryId = this.model.get('libraryId'),
                library = this.filter.getLibrary(libraryId),
                uploadView = new UploadView({
                    library: library,
                    workflows: this.workflows,
                    model: this.model
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
                isShared = this.isSharedContent(),
                searchTemplate = isShared ?
                    new URITemplate(this.root.getLink('ev:Sharing/Search').href) :
                    new URITemplate(this.root.getLink('ev:Contents/Search').href),
                searchUrl = searchTemplate.expand({
                    organizationId: this.model.get('organizationId'),
                    libraryId: this.model.get('libraryId'),
                    search: searchVal,
                    sortBy: isShared ? 'PostDate' : 'dateAdded',
                    isPublished: true,
                    desc: true,
                    pageSize: 20
                });
            this.videos = isShared ?
                new SharedVideos({}, {
                    href: searchUrl
                }) :
                new Videos({}, {
                    href: searchUrl
                });

            this.filter.disable();
            this.videos.fetch({
                picker: this,
                success: _.bind(function(model, response, options) {
                    this.resultsView.model = model;
                    this.resultsView.collection = model.getEmbedded('contents');
                    this.resultsView.render();
                }, this),
                error: _.bind(this.ajaxError, this)
            })
            .always(_.bind(function() {
                this.filter.enable();
            }, this));
        },
        loadWorkflows: function() {
            var libraryId = this.model.get('libraryId'),
                searchTemplate = new URITemplate(this.root.getLink('ev:Workflows/Search').href),
                searchUrl = searchTemplate.expand({
                    libraryId: libraryId,
                    pageSize: 100,
                    type: 'UploadDirectory',
                    isEnabled: true
                });

            this.workflows = new Workflows({}, {
                href: searchUrl
            });
            this.workflows.fetch({
                picker: this,
                error: _.bind(this.ajaxError, this),
            });
        },
        canRecord: function() {
            var currentUser = this.root.getUser();
            return currentUser && currentUser.get('canUseAnthem') && !this.isMobile() && platform.os.family !== 'Linux';
        },
        isMobile: function() {
            var family = platform.os.family;
            return family === 'Android' || family === 'iOS' || family === 'Windows Phone';
        },
        isSharedContent: function() {
            return this.model && this.model.get('sourceId') === 'shared';
        }
    });

});
