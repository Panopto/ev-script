define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        FieldView = require('ev-script/views/field'),
        Video = require('ev-script/models/video'),
        VideoEncoding = require('ev-script/models/video-encoding'),
        // We borrow from video field impl
        VideoFieldView = require('ev-script/views/video-field'),
        QuizSettings = require('ev-script/models/quiz-settings'),
        QuizPickerView = require('ev-script/views/quiz-picker'),
        QuizSettingsView = require('ev-script/views/quiz-settings'),
        QuizPreviewView = require('ev-script/views/quiz-preview');

    return FieldView.extend({
        initialize: function(options) {
            FieldView.prototype.initialize.call(this, options);
        },
        initCallback: function() {

            this.encoding = new VideoEncoding({}, {});

            // TODO - This is the pattern from video-field...but don't think it is necessary/used.
            this.root.promise.done(_.bind(function() {
                var contentUrl = this.root.getLink('ev:Contents/Get'),
                    contentUrlTemplate = contentUrl && new URITemplate(contentUrl.href),
                    video, encoding;
                if (!this.model.isNew() && contentUrlTemplate && this.model.get('contentId')) {
                    video = new Video({}, {
                        href: contentUrlTemplate.expand({
                            id: this.model.get('contentId')
                        })
                    });
                    video.fetch()
                    .done(_.bind(function(response) {
                        encoding = video.getEmbedded('ev:Encodings/Default');
                        this.encoding.set(encoding.attributes);
                    }, this));
                }
            }, this));

            this.model.on('change', _.bind(function() {
                this.root.promise.done(_.bind(function() {
                    var contentUrl = this.root.getLink('ev:Contents/Get'),
                        contentUrlTemplate = contentUrl && new URITemplate(contentUrl.href),
                        video, encoding;
                    // If the contentId has changed, we need to fetch the
                    // relevant content for it's default encoding
                    if (this.model.changed.contentId) {
                        this.encoding.clear();
                        // Only fetch is model is not new, i.e. wasn't cleared
                        if (!this.model.isNew() && contentUrlTemplate) {
                            video = new Video({}, {
                                href: contentUrlTemplate.expand({
                                    id: this.model.get('contentId')
                                })
                            });
                            video.fetch()
                            .always(_.bind(function(response) {
                                encoding = video.getEmbedded('ev:Encodings/Default');
                                this.encoding.set(encoding && encoding.attributes || {});
                                // Note this will trigger another change
                                this.encoding.updateSettingsModel(this.model);
                                // Picker model is a copy so need to update that as well
                                this.encoding.updateSettingsModel(this.picker.model);
                                this.updateField();
                            }, this));
                        }
                    } else {
                        if (!this.model.isNew()) {
                            this.updateField();
                        }
                    }
                }, this));
            }, this));
        },
        getPickerInstance: function(pickerOptions) {
            return new QuizPickerView(_.extend({}, pickerOptions, {
                // Picker uses a copy of the supplied settings model
                model: new QuizSettings(this.model.toJSON()),
            }));
        },
        getSettingsInstance: function(settingsOptions) {
            return new QuizSettingsView(_.extend(settingsOptions, {
                encoding: this.encoding
            }));
        },
        getPreviewInstance: function(previewOptions) {
            return new QuizPreviewView(previewOptions);
        },
        getFieldType: function() {
            return 'quiz';
        },
        getFieldLabel: function() {
            return this.i18n.formatMessage('Quiz');
        },
        getActionsHtml: function(templateOptions) {
            return VideoFieldView.prototype.getActionsHtml.call(this, templateOptions);
        }
    });

});
