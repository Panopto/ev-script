define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        log = require('loglevel'),
        URITemplate = require('urijs/URITemplate'),
        BaseModel = require('ev-script/models/base'),
        BaseView = require('ev-script/views/base'),
        BaseCollection = require('ev-script/collections/base'),
        Backbone = require('backbone'),
        WorkflowSelect = require('ev-script/views/workflow-select'),
        VideoSettings = require('ev-script/models/video-settings'),
        MediaTypes = require('ev-script/models/media-types'),
        Uppy = require('uppy'),
        uppyLocales = {
            'en': require('uppy-locales/en_US.min'),
            'en-US': require('uppy-locales/en_US.min'),
            'es': require('uppy-locales/es_ES.min'),
            'es-MX': require('uppy-locales/es_ES.min'),
            'fr': require('uppy-locales/fr_FR.min'),
            'fr-FR': require('uppy-locales/fr_FR.min')
        };

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/upload.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            _.bindAll(this, 'render', 'initUploader', 'closeDialog',
                'disableFields', 'unloadCallback', 'uploadInProgress',
                'handleSubmit');

            this.$anchor = this.$el;

            this.setElement(this.template({
                i18n: this.i18n
            }));

            this.delegateEvents({
                'submit': 'handleSubmit'
            });

            this.$select = this.$('select');
            this.$upload = this.$('.upload');
            this.$title = this.$('#Title');
            this.$description = this.$('#Description');

            this.library = options.library;
            this.workflows = options.workflows;
            this.workflowSelect = new WorkflowSelect({
                el: this.$select[0],
                collection: this.workflows.getEmbedded(this.workflows.collectionKey)
            });

            this.extensions = [];

            this.render().done(this.initUploader);

            this.events.on('hidePickers', this.closeDialog);
        },
        getWidth: function() {
            return Math.min(600, $(window).width() - this.config.dialogMargin);
        },
        getHeight: function() {
            return Math.min(420, $(window).height() - this.config.dialogMargin);
        },
        disableFields: function(disable) {
            this.$select.prop('disabled', disable);
            this.$title.prop('disabled', disable);
            this.$description.prop('disabled', disable);
        },
        initUploader: function() {
            var selected = this.workflowSelect.getSelected(),
                maxUploadSize = parseInt(selected.get('maxUploadSize'), 10);

            if (this.uploader) {
                this.uploader.close();
            }

            this.uploader = Uppy.Core({
                allowMultipleUploads: false,
                autoProceed: true,
                debug: true,
                restrictions: {
                    maxFileSize: maxUploadSize * 1073741824, // GB to bytes
                    maxNumberOfFiles: 1,
                    minNumberOfFiles: 1,
                    allowedFileTypes: this.extensions
                },
                locale: uppyLocales[this.config.locale || 'en-US'],
                onBeforeUpload: _.bind(function (files) {
                    var title = this.$title.val(),
                        description = this.$description.val(),
                        tus = this.uploader.getPlugin('Tus'),
                        createLink = this.library.getLink('ev:Contents/Create');

                    if (!title || title.trim() === '') {
                        this.$title.focus();
                        return false;
                    }

                    if (!this.content) {
                        this.auth.userManager.getUser()
                        .then(_.bind(function(user) {
                            if (!user || user.expired) {
                                this.events.trigger('loggedOut');
                                this.closeDialog();
                                return;
                            }

                            if (!tus.opts.headers) {
                                tus.opts.headers = {};
                            }
                            tus.opts.headers['Authorization'] = 'Bearer ' + user.access_token;

                            $.ajax(createLink.href, {
                                method: createLink.method,
                                headers: {
                                    'Authorization': 'Bearer ' + user.access_token,
                                    'Accept': 'application/hal+json; charset=UTF-8'
                                },
                                data: JSON.stringify({
                                    libraryId: this.library.get('id'),
                                    type: 'UploadDirectory',
                                    name: title,
                                    description: description,
                                    autoPublish: true
                                }),
                                contentType: 'application/json; charset=UTF-8',
                                beforeSend: _.bind(function () {
                                    this.disableFields(true);
                                }, this),
                                success: _.bind(function (data) {
                                    this.content = new BaseModel(data);
                                    this.$('.alert').hide();
                                    this.uploader.upload();
                                }, this),
                                error: _.bind(function (data) {
                                    if (data && data.responseText) {
                                        this.$('.alert').text(data.responseText).show();
                                    }
                                    this.disableFields(false);
                                }, this)
                            });

                        }, this))
                        .catch(_.bind(function(err) {
                            log.error(err);
                        }, this));

                        return false;
                    }

                    tus.opts.endpoint = this.content.getLink('ev:Encodings/Upload').href;

                    this.uploader.setMeta({
                        mediaWorkflowId: this.$('select').val()
                    });

                    return true;
                }, this)
            })
            .use(Uppy.Tus, {
                retryDelays: [0, 1000, 3000, 5000, 10000, 30000],
                removeFingerprintOnSuccess: this.config.hasStorage,
                withCredentials: true,
                chunkSize: 2097152000
            })
            .use(Uppy.Dashboard, {
                inline: true,
                width: '100%', // Docs say this should be int, but this appears to work
                height: 200, // https://github.com/transloadit/uppy/issues/1127
                target: '.upload',
                showProgressDetails: true,
                showLinkToFileUploadResult: false,
                proudlyDisplayPoweredByUppy: false,
                locale: {
                    strings: {
                        done: this.i18n.formatMessage('Done'),
                        removeFile: this.i18n.formatMessage('Remove file'),
                        dropPaste: '%{browse}' + this.i18n.formatMessage('Select file to upload'),
                        browse: '',
                        uploadComplete: this.i18n.formatMessage('Upload complete'),
                        resumeUpload: this.i18n.formatMessage('Resume upload'),
                        pauseUpload: this.i18n.formatMessage('Pause upload'),
                        retryUpload: this.i18n.formatMessage('Retry upload'),
                        xFilesSelected: {
                            0: '%{smart_count} ' + this.i18n.formatMessage('file selected'),
                            1: '%{smart_count} ' + this.i18n.formatMessage('files selected')
                        },
                        uploading: this.i18n.formatMessage('Uploading'),
                        complete: this.i18n.formatMessage('Complete')
                    }
                }
            });

            this.uploader.on('complete', $.proxy(function (result) {
               if (result && result.successful && result.successful.length > 0) {
                    this.events.trigger('reload', 'videos');
                    this.closeDialog();
                    return;
                }

               this.disableFields(false);
            }, this));

            window.addEventListener('beforeunload', this.unloadCallback);
        },
        unloadCallback: function (e) {
            var files = this.uploader.getFiles(),
                block = false;
            $.each(files, function (index, file) {
                if (!file.progress.uploadComplete) {
                    block = true;
                    return false;
                }
            });
            if (block) {
                e.preventDefault();
                e.returnValue = '';
            }
        },
        uploadInProgress: function() {
            var files = this.uploader.getFiles(),
                inProgress = false;
            $.each(files, function (index, file) {
                if (!file.progress.uploadComplete) {
                    inProgress = true;
                    return false;
                }
            });
            return inProgress;
        },
        closeDialog: function() {
            if (!this.uploadInProgress() && this.$dialog) {
                this.$dialog.dialog('close');
            }
        },
        render: function() {
            var $dialogWrap = $('<div class="dialogWrap"></div>'),
                policyMessage = _.unescape(this.root.getEmbedded('ev:Brandings/Current').get('policyMessage')),
                searchTemplate = new URITemplate(this.root.getLink('ev:MediaTypes/Search').href),
                searchUrl = searchTemplate.expand({
                    type: 'audio,video',
                    pageSize: 100
                }),
                mediaTypesCollection = new BaseCollection(null, {}),
                fetchMediaTypes = _.bind(function(url) {
                    var mediaTypes = new MediaTypes({}, {
                            href: url
                        });
                    return mediaTypes.fetch({
                        success: _.bind(function(model, response, options) {
                            var next = model.getLink('next'),
                                embedded = model.getEmbedded('mediaTypes');
                            if (embedded) {
                                mediaTypesCollection.add(embedded.models);
                            }
                            if (next) {
                                fetchMediaTypes(next.href);
                            } else {
                                mediaTypesCollection.trigger('reset');
                            }
                        }, this),
                        error: _.bind(this.ajaxError, this)
                    });
                }, this);

            return fetchMediaTypes(searchUrl).then(_.bind(function() {
                this.$('.policy-message').html(policyMessage);

                this.extensions = mediaTypesCollection.pluck('extension');
                this.extensions = _.map(this.extensions, function(extension) {
                    return extension.toLowerCase().replace(/^\*/g, '');
                });

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
                    beforeClose: _.bind(function() {
                        return this.uploadInProgress() ?
                            window.confirm(this.i18n.formatMessage('Your changes haven\'t been saved!')) :
                            true;
                    }, this),
                    close: _.bind(function(event, ui) {
                        if (this.uploader) {
                            this.uploader.close();
                        }
                        $dialogWrap.dialog('destroy').remove();
                        this.events.off('hidePickers', this.closeDialog);
                        this.$dialog = null;
                    }, this)
                });
            }, this));
        },
        handleSubmit: function(e) {
            e.preventDefault();
        }
    });

});
