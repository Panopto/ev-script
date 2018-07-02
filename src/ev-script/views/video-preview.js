define(function(require) {

    'use strict';

    var _ = require('underscore'),
        PreviewView = require('ev-script/views/preview'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        VideoEncoding = require('ev-script/models/video-encoding');

    return PreviewView.extend({
        embedClass: VideoEmbedView,
        initialize: function(options) {
            this.encoding = options.encoding || new VideoEncoding({}, {
                href: options.selectedItem.getLink('ev:Encodings/Default').href
            });
            this.picker = options.picker;
            var responseCallback = _.bind(function() {
                this.encoding.updateSettingsModel(this.model);
                // Picker model is a copy so need to update that as well
                this.encoding.updateSettingsModel(this.picker.model);
                PreviewView.prototype.initialize.call(this, options);
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
