define(function(require) {

    'use strict';

    var _ = require('underscore'),
        PreviewView = require('ev-script/views/preview'),
        VideoEmbedView = require('ev-script/views/video-embed'),
        VideoEncoding = require('ev-script/models/video-encoding');

    return PreviewView.extend({
        embedClass: VideoEmbedView,
        initialize: function(options) {
            // Although our super sets this...we don't call our super init until
            // later so we should set appId here
            this.appId = options.appId;
            this.encoding = options.encoding || new VideoEncoding({
                fetchId: this.model.id
            }, {
                appId: this.appId
            });
            var success = _.bind(function() {
                if (!this.model.get('width') || !this.model.get('height')) {
                    this.model.set({
                        width: this.encoding.getWidth(),
                        height: this.encoding.getHeight()
                    });
                }
                PreviewView.prototype.initialize.call(this, options);
            }, this);
            if (this.encoding.isNew()) {
                this.encoding.fetch({
                    dataType: 'jsonp',
                    success: success
                });
            } else {
                success();
            }
        }
    });

});
