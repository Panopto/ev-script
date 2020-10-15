define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseModel = require('ev-script/models/base'),
        BaseView = require('ev-script/views/base'),
        PreviewView = require('ev-script/views/preview'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        VideoEncoding = require('ev-script/models/video-encoding');

    return PreviewView.extend({
        embedClass: VideoEmbedView,
        initialize: function(options) {
            var contentModel,
                responseCallback,
                embedView,
                targetUrl;

            BaseView.prototype.initialize.call(this, options);

            this.encoding = options.encoding;
            if (!this.encoding) {
                contentModel = new BaseModel(options.model.get('content'));
                this.encoding = new VideoEncoding({}, {
                    href: contentModel.getLink('ev:Encodings/Default').href
                });
            }

            this.picker = options.picker;

            responseCallback = _.bind(function() {
                this.encoding.updateSettingsModel(this.model);
                // Picker model is a copy so need to update that as well
                this.encoding.updateSettingsModel(this.picker.model);

                // Assuming if localStorage is not available that third-party
                // cookies are blocked.  In that case need to preview in new window.
                // If we're the top window we don't know if TPCs are blocked so
                // assume so.
                if (this.config.tpcEnabled && !this.isTop()) {
                    return PreviewView.prototype.render.call(this, options);
                }

                embedView = new VideoEmbedView({
                    model: new this.model.constructor(this.model.toJSON()),
                    config: this.config
                });
                targetUrl = embedView.getUrl(null, null, true);

                window.open(targetUrl);
            }, this);

            if (this.encoding.isNew()) {
                this.encoding.fetch({
                    // The loader indicator will show if it detects an AJAX
                    // request on our picker
                    picker: this.picker
                }).always(responseCallback);
            } else {
                responseCallback();
            }
        }
    });

});
