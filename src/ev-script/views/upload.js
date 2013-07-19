/*global window*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        BaseView = require('ev-script/views/base'),
        MediaWorkflows = require('ev-script/collections/media-workflows'),
        WorkflowSelect = require('ev-script/views/workflow-select'),
        VideoSettings = require('ev-script/models/video-settings');

    // Explicit dependency declaration
    require('plupload');
    require('jquery.plupload.queue');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/upload.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render', 'loadWorkflows', 'decorateUploader', 'closeDialog');
            this.field = options.field;
            this.$form = $(this.template());
            this.$upload = $('.upload', this.$form);
            this.workflows = new MediaWorkflows({}, {
                appId: this.appId
            });
            this.workflows.on('reset', function() {
                this.render();
            }, this);
            this.workflowSelect = new WorkflowSelect({
                appId: this.appId,
                el: $('select', this.$form)[0],
                collection: this.workflows
            });
            this.loadWorkflows();
            this.appEvents.on('hidePickers', this.closeDialog);
        },
        loadWorkflows: function() {
            // We need to get the current user's home library id before we fetch
            if (this.auth.isAuthenticated() && this.auth.getUser()) {
                this.workflows.filterValue = this.auth.getUser().get('LibraryID');
                this.workflows.fetch({
                    cacheKey: this.workflows.filterValue,
                    error: _.bind(function(collection, xhr, options) {
                        this.ajaxError(xhr, _.bind(function() {
                            this.loadWorkflows();
                        }, this));
                    }, this),
                    reset: true
                });
            } else {
                this.auth.handleUnauthorized(this.el, this.loadWorkflows);
            }
        },
        getWidth: function() {
            return Math.min(600, $(window).width() - this.config.dialogMargin);
        },
        getHeight: function() {
            return Math.min(400, $(window).height() - this.config.dialogMargin);
        },
        decorateUploader: function() {
            var extensions = this.workflows.settings.SupportedVideo.replace('*.', '', 'g').replace(';', ',', 'g');
            // this.$upload.plupload('destroy');
            this.$upload.pluploadQueue({
                url: this.workflows.settings.SubmitUrl,
                runtimes: 'html5,flash',
                // max_file_count: 1,
                filters: [
                    {
                        title: 'Video files',
                        extensions: extensions
                    }
                ],
                flash_swf_url: this.config.pluploadFlashPath,
                preinit: {
                    Init: _.bind(function(up, info) {
                        // Remove runtime tooltip
                        $('.plupload_container', this.$upload).removeAttr('title');
                    }, this),
                    UploadFile: _.bind(function(up, file) {
                        up.settings.multipart_params = {
                            'MediaWorkflowID': $('select', this.$form).val()
                        };
                    }, this)
                },
                init: {
                    FileUploaded: _.bind(function(up, file, info) {
                        // TODO - do the right thing with this Does it make
                        // sense to immediately embed...or just flush video
                        // cache and allow user to do that? In the latter case
                        // why not just allow multiple video uploads?
                        // var response = JSON.parse(info.response);
                        // var contentId = response.ContentID;
                        this.appEvents.trigger('fileUploaded');
                    }, this)
                }
            });
            // Hacks to deal with z-index issue in dialog
            // see https://github.com/moxiecode/plupload/issues/468
            this.$upload.pluploadQueue().bind('refresh', function() {
                $('div.upload > div.plupload').css({ 'z-index': '0' });
                $('.plupload_button').css({ 'z-index': '1' });
            });
            this.$upload.pluploadQueue().refresh();
        },
        closeDialog: function() {
            if (this.$dialog) {
                this.$dialog.dialog('close');
            }
        },
        render: function() {
            var $dialogWrap = $('<div class="dialogWrap"></div>'),
                $dialog;
            this.$el.after($dialogWrap);
            this.$dialog = $dialogWrap.dialog({
                title: 'Upload Video to Ensemble',
                modal: true,
                width: this.getWidth(),
                height: this.getHeight(),
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    $dialogWrap.html(this.$form);
                }, this),
                open: _.bind(function(event, ui) {
                    this.decorateUploader();
                }, this),
                close: _.bind(function(event, ui) {
                    this.workflows.off('reset');
                    this.$upload.pluploadQueue().destroy();
                    $dialogWrap.dialog('destroy').remove();
                    this.appEvents.off('hidePickers', this.closeDialog);
                    this.$dialog = null;
                }, this)
            });
        }
    });

});
