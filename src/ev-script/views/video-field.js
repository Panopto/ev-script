define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
        BaseModel = require('ev-script/models/base'),
        FieldView = require('ev-script/views/field'),
        VideoSettings = require('ev-script/models/video-settings'),
        VideoPickerView = require('ev-script/views/video-picker'),
        VideoSettingsView = require('ev-script/views/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview'),
        VideoEncoding = require('ev-script/models/video-encoding');

    return FieldView.extend({
        initialize: function(options) {
            FieldView.prototype.initialize.call(this, options);
        },
        initCallback: function() {
            this.encoding = new VideoEncoding({}, {});

            this.root.promise.done(_.bind(function() {
                var encodingUrl = this.root.getLink('ev:Encodings/Default'),
                    encodingUrlTemplate = encodingUrl && new URITemplate(encodingUrl.href);
                if (!this.model.isNew() && encodingUrlTemplate) {
                    this.encoding.href = encodingUrlTemplate.expand({
                        contentId: this.model.id
                    });
                    this.encoding.fetch();
                }
            }, this));

            this.model.on('change', _.bind(function() {
                this.root.promise.done(_.bind(function() {
                    var encodingUrl = this.root.getLink('ev:Encodings/Default'),
                        encodingUrlTemplate = encodingUrl && new URITemplate(encodingUrl.href);
                    // If the id has changed, we need to fetch the relevant encoding
                    if (this.model.changed.id) {
                        this.encoding.clear();
                        // Only fetch encoding if identifier is set
                        if (!this.model.isNew() && encodingUrlTemplate) {
                            this.encoding.href = encodingUrlTemplate.expand({
                                contentId: this.model.id
                            });
                            this.encoding.fetch()
                            .always(_.bind(function(response) {
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
            return new VideoPickerView(_.extend({}, pickerOptions, {
                // We don't want to modify field model until we actually pick a new video...so use a copy as our current model
                model: new VideoSettings(this.model.toJSON()),
            }));
        },
        getSettingsInstance: function(settingsOptions) {
            return new VideoSettingsView(_.extend(settingsOptions, {
                encoding: this.encoding
            }));
        },
        getPreviewInstance: function(previewOptions) {
            return new VideoPreviewView(_.extend(previewOptions, {
                encoding: this.encoding
            }));
        },
        getFieldType: function() {
            return 'video';
        },
        getFieldLabel: function() {
            return this.i18n.formatMessage('Media');
        },
        getActionsHtml: function(templateOptions) {
            var branding = this.root.getEmbedded('ev:Brandings/Current'),
                contentModel = this.model.get('content') && new BaseModel(this.model.get('content')),
                thumbnailLink = contentModel && contentModel.getLink('ev:Images/Thumbnail'),
                thumbnailTemplate = thumbnailLink ? thumbnailLink.href : branding.get('thumbnailImageUrlTemplate'),
                thumbnailUrl = new URITemplate(thumbnailTemplate).expand({
                    width: 200,
                    height: 112
                });

            _.extend(templateOptions, {
                thumbnailUrl: thumbnailUrl
            });
            return FieldView.prototype.getActionsHtml.call(this, templateOptions);
        }
    });

});
