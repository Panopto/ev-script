define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        plupload = require('plupload'),
        BaseView = require('ev-script/views/base'),
        Backbone = require('backbone'),
        WorkflowSelect = require('ev-script/views/workflow-select'),
        VideoSettings = require('ev-script/models/video-settings');

    // Explicit dependency declaration
    require('jquery.plupload.queue');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/upload.html')),
        events: {
            'change select': 'handleSelect'
        },
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            _.bindAll(this, 'render', 'decorateUploader', 'closeDialog', 'handleSelect');
            this.field = options.field;
            this.$anchor = this.$el;
            this.setElement(this.template({
                i18n: this.i18n
            }));
            this.$upload = this.$('.upload');
            this.workflows = options.workflows;
            this.workflowSelect = new WorkflowSelect({
                appId: this.appId,
                el: this.$('select')[0],
                collection: this.workflows
            });
            this.render();
            this.decorateUploader();
            this.appEvents.on('hidePickers', this.closeDialog);
        },
        getWidth: function() {
            return Math.min(600, $(window).width() - this.config.dialogMargin);
        },
        getHeight: function() {
            return Math.min(400, $(window).height() - this.config.dialogMargin);
        },
        decorateUploader: function() {
            var extensions = '',
                selected = this.workflowSelect.getSelected(),
                maxUploadSize = parseInt(selected.get('MaxUploadSize'), 10),
                policyMessage = this.info.checkVersion('>=4.8.0') ? _.unescape(selected.get('PolicyMessage')) : '';

            this.$('.policy-message').html(policyMessage);

            if (this.workflows.settings.SupportedVideo) {
                extensions += this.workflows.settings.SupportedVideo.replace(/\*\./g, '').replace(/;/g, ',').replace(/\s/g, '');
            }

            if (this.workflows.settings.SupportedAudio) {
                extensions += this.workflows.settings.SupportedAudio.replace(/\*\./g, '').replace(/;/g, ',').replace(/\s/g, '');
            }

            if (this.$upload.pluploadQueue()) {
                this.$upload.pluploadQueue().destroy();
            }

            this.$upload.pluploadQueue({
                url: this.workflows.settings.SubmitUrl,
                runtimes: 'html5,html4,flash',
                max_file_size: maxUploadSize > 0 ? maxUploadSize + 'gb' : '12gb',
                max_file_count: 1,
                max_retries: 5,
                chunk_size: '2mb',
                unique_names: false,
                multiple_queues: false,
                multi_selection: false,
                drag_drop: true,
                multipart: true,
                flash_swf_url: this.config.pluploadFlashPath,
                preinit: {
                    Init: _.bind(function(up, info) {
                        // Remove runtime tooltip
                        $('.plupload_container', this.$upload).removeAttr('title');
                        // Change text since we only allow single file upload
                        $('.plupload_add', this.$upload).text(this.i18n.formatMessage('Add file'));
                    }, this),
                    PostInit: _.bind(function(up, info) {
                        // Change text since we only allow single file upload
                        $('.plupload_droptext', this.$upload).text(this.i18n.formatMessage('Drag file here.'));
                    }, this),
                    UploadFile: _.bind(function(up, file) {
                        up.settings.multipart_params = {
                            'Title': this.$('#Title').val(),
                            'Description': this.$('#Description').val(),
                            'MediaWorkflowID': this.$('select').val()
                        };
                    }, this)
                },
                init: {
                    StateChanged: _.bind(function(up) {
                        switch (up.state) {
                            case plupload.STARTED:
                                if (up.state === plupload.STARTED) {
                                    if ($('.plupload_cancel', this.$upload).length === 0) {
                                        // Add cancel button
                                        this.$cancel = $('<a class="plupload_button plupload_cancel" href="#">' + this.i18n.formatMessage('Cancel upload') + '</a>')
                                        .insertBefore($('.plupload_filelist_footer .plupload_clearer', this.$upload))
                                        .click(_.bind(function() {
                                            up.stop();
                                            this.decorateUploader();
                                        }, this));
                                    }
                                    if (this.$cancel) {
                                        this.$cancel.show();
                                    }
                                }
                                break;
                            case plupload.STOPPED:
                                if (this.$cancel) {
                                    this.$cancel.hide();
                                }
                                break;
                        }
                    }, this),
                    BeforeUpload: _.bind(function(up, file) {
                        var $title = this.$('#Title'),
                            title = $title.val();
                        if (!title || title.trim() === '') {
                            $title.focus();
                            up.stop();
                            $('.plupload_upload_status', this.$upload).hide();
                            $('.plupload_buttons', this.$upload).show();
                        }
                    }, this),
                    FilesAdded: _.bind(function(up, files) {
                        var validExtensions = extensions.split(',');
                        _.each(files, function(file) {
                            var parts = file.name.split('.'),
                                extension = parts[parts.length - 1];
                            if (!_.contains(validExtensions, extension.toLowerCase())) {
                                up.removeFile(file);
                                up.trigger('Error', {
                                    code : plupload.FILE_EXTENSION_ERROR,
                                    message : plupload.translate('File extension error.'),
                                    file : file
                                });
                            }
                        });
                        // Keep the last file in the queue
                        if (up.files.length > 1) {
                            up.splice(0, up.files.length - 1);
                        }
                    }, this),
                    UploadComplete: _.bind(function() {
                        this.closeDialog();
                    }, this),
                    FileUploaded: _.bind(function(up, file, info) {
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
        handleSelect: function(e) {
            this.decorateUploader();
        },
        render: function() {
            var $dialogWrap = $('<div class="dialogWrap"></div>'),
                $dialog;
            this.$anchor.after($dialogWrap);
            this.$dialog = $dialogWrap.dialog({
                title: this.i18n.formatMessage('Upload Media to Ensemble'),
                modal: true,
                width: this.getWidth(),
                height: this.getHeight(),
                draggable: false,
                resizable: false,
                dialogClass: 'ev-dialog',
                create: _.bind(function(event, ui) {
                    $dialogWrap.html(this.$el);
                }, this),
                closeText: this.i18n.formatMessage('Close'),
                close: _.bind(function(event, ui) {
                    this.$upload.pluploadQueue().destroy();
                    $dialogWrap.dialog('destroy').remove();
                    this.appEvents.off('hidePickers', this.closeDialog);
                    this.$dialog = null;
                }, this)
            });
        }
    });

});
