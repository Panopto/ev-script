define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        DropboxEmbedView = require('ev-script/views/dropbox-embed');

    return PreviewView.extend({
        embedClass: DropboxEmbedView,
        render: function() {
            var embedView,
                targetUrl;
            // Assuming if localStorage is not available that third-party
            // cookies are blocked.  In that case need to preview in new window.
            if (this.info.checkVersion('5.3.0', '<') ||
                !this.config.hasStorage ||
                this.isTop()) {
                embedView = new DropboxEmbedView({
                    model: new this.model.constructor(this.model.toJSON()),
                    config: this.config
                });
                targetUrl = embedView.getUrl(true);
                window.open(targetUrl);
            } else {
                PreviewView.prototype.render.call(this);
            }
        }
    });

});
