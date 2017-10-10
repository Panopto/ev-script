define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        platform = require('platform'),
        PickerView = require('ev-script/views/picker'),
        SearchView = require('ev-script/views/search'),
        TypeSelectView = require('ev-script/views/library-type-select'),
        UnitSelectsView = require('ev-script/views/unit-selects'),
        VideoResultsView = require('ev-script/views/video-results'),
        Videos = require('ev-script/collections/videos'),
        MediaWorkflows = require('ev-script/collections/media-workflows'),
        UploadView = require('ev-script/views/upload');

    require('base64');

    return PickerView.extend({
        anthemTemplate: _.template(require('text!ev-script/templates/anthem.html')),
        initialize: function(options) {
            PickerView.prototype.initialize.call(this, options);
            _.bindAll(this, 'loadVideos', 'loadWorkflows', 'changeLibrary', 'handleSubmit', 'uploadHandler', 'recordHandler');
            var callback = _.bind(function() {
                this.loadVideos();
            }, this);
            this.$filterBlock = this.$('div.ev-filter-block');
            if (this.info.get('ApplicationVersion')) {
                this.$actions = $('<div class="ev-actions"></div>');
                this.$upload = $('<button type="button" class="action-upload" title="' + this.i18n.formatMessage('Click to upload new media') + '"><i class="fa fa-upload fa-fw"></i><span>' + this.i18n.formatMessage('Upload') + '<span></button>').css('display', 'none');
                this.$actions.append(this.$upload);
                this.$record = $('<button type="button" class="action-record" title="' + this.i18n.formatMessage('Click to record screen') + '"><i class="record-inactive fa fa-circle fa-fw"></i><i class="record-active fa fa-refresh fa-spin fa-fw" style="display:none;"></i><span>' + this.i18n.formatMessage('Record') + '<span></button>').css('display', 'none');
                this.$actions.append(this.$record);
                this.$filterBlock.prepend(this.$actions);
            }
            this.searchView = new SearchView({
                id: this.id + '-search',
                tagName: 'div',
                className: 'ev-search',
                picker: this,
                appId: this.appId,
                callback: callback
            });
            this.$filterBlock.prepend(this.searchView.$el);
            this.searchView.render();
            this.typeSelectView = new TypeSelectView({
                id: this.id + '-type-select',
                tagName: 'div',
                className: 'ev-type-select',
                picker: this,
                appId: this.appId,
                callback: callback
            });
            this.$filterBlock.prepend(this.typeSelectView.$el);
            this.typeSelectView.render();
            if (this.info.get('ApplicationVersion')) {
                this.unitSelects = new UnitSelectsView({
                    id: this.id + '-unit-selects',
                    tagName: 'div',
                    className: 'ev-unit-selects',
                    picker: this,
                    appId: this.appId
                });
                this.$filterBlock.prepend(this.unitSelects.$el);
            }
            this.resultsView = new VideoResultsView({
                el: this.$('div.ev-results'),
                picker: this,
                appId: this.appId
            });
            this.$el.append(this.resultsView.$el);
        },
        events: {
            'click .action-add': 'chooseItem',
            'click .action-upload': 'uploadHandler',
            'click .action-record': 'recordHandler',
            'change .unit-selects select.libraries': 'changeLibrary',
            'submit .unit-selects': 'handleSubmit'
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
                appId: this.appId,
                field: this.field,
                workflows: this.workflows
            });
            e.preventDefault();
        },
        recordHandler: function(e) {
            var activeIcon = $('.record-active', this.$record),
                inactiveIcon = $('.record-inactive', this.$record),
                pollingId,
                timeoutId,
                activate = _.bind(function() {
                    this.anthemLaunching = true;
                    inactiveIcon.hide();
                    activeIcon.show();
                }, this),
                deactivate = _.bind(function() {
                    this.anthemLaunching = false;
                    inactiveIcon.show();
                    activeIcon.hide();
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
            if (this.info.get('ApplicationVersion')) {
                this.unitSelects.loadOrgs();
                this.unitSelects.$('select').filter(':visible').first().focus();
            } else {
                this.searchView.$('input[type="text"]').focus();
                this.loadVideos();
            }
        },
        loadVideos: function() {
            var searchVal = $.trim(this.model.get('search').toLowerCase()),
                sourceId = this.model.get('sourceId'),
                libraryId = this.model.get('libraryId'),
                cacheKey = sourceId + libraryId + searchVal,
                videos = new Videos({}, {
                    sourceId: sourceId,
                    libraryId: libraryId,
                    filterOn: '',
                    filterValue: searchVal,
                    appId: this.appId
                }),
                clearVideosCache = _.bind(function() {
                    videos.clearCache();
                    this.loadVideos();
                }, this);
            videos.fetch({
                picker: this,
                cacheKey: cacheKey,
                success: _.bind(function(collection, response, options) {
                    var totalRecords = collection.totalResults = parseInt(response.Pager.TotalRecords, 10);
                    var size = _.size(response.Data);
                    if (size === totalRecords) {
                        collection.hasMore = false;
                    } else {
                        collection.hasMore = true;
                        collection.pageIndex += 1;
                    }
                    this.resultsView.collection = collection;
                    this.resultsView.render();
                }, this),
                error: _.bind(function(collection, xhr, options) {
                    this.ajaxError(xhr, _.bind(function() {
                        this.loadVideos();
                    }, this));
                }, this)
            });
            this.appEvents.off('fileUploaded').on('fileUploaded', clearVideosCache);
            this.appEvents.off('reloadVideos').on('reloadVideos', clearVideosCache);
        },
        loadWorkflows: function() {
            this.workflows = new MediaWorkflows({}, {
                appId: this.appId
            });
            // FIXME - add libraryId (as with playlists)
            this.workflows.filterValue = this.model.get('libraryId');
            this.workflows.fetch({
                cacheKey: this.workflows.filterValue,
                success: _.bind(function(collection, response, options) {
                    if (!collection.isEmpty()) {
                        this.$upload.css('display', 'inline-block');
                        if (this.canRecord()) {
                            this.$record.css('display', 'inline-block');
                        }
                    } else {
                        this.$upload.css('display', 'none');
                        this.$record.css('display', 'none');
                    }
                    // This is the last portion of the filter block that loads
                    // so now it should be fully rendered...resize our results
                    // to make sure they have the proper height.
                    // TODO - better place for this? Or better method of
                    // handling?
                    this.resizeResults();
                }, this),
                error: _.bind(function(collection, xhr, options) {
                    this.ajaxError(xhr, _.bind(function() {
                        this.loadWorkflows();
                    }, this));
                }, this),
                reset: true
            });
        },
        resizeResults: function() {
            if (this.config.fitToParent) {
                this.resultsView.setHeight(this.$el.height() - this.hider.$el.outerHeight(true) - this.$filterBlock.outerHeight(true));
            }
        },
        canRecord: function() {
            var currentUser = this.auth.getUser();
            return this.info.anthemEnabled() && currentUser && currentUser.get('CanUseAnthem') && !this.isMobile() && platform.os.family !== 'Linux';
        },
        isMobile: function() {
            var family = platform.os.family;
            return family === 'Android' || family === 'iOS' || family === 'Windows Phone';
        }
    });

});
