define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed');

    return PreviewView.extend({
        embedClass: PlaylistEmbedView,
        render: function() {
            var embedView,
                targetUrl;

            // Assuming if localStorage is not available that third-party
            // cookies are blocked.  In that case need to preview in new window.
            // If we're the top window we don't know if TPCs are blocked so
            // assume so.
            if (this.config.hasStorage && !this.isTop()) {
                return PreviewView.prototype.render.call(this);
            }

            embedView = new PlaylistEmbedView({
                model: new this.model.constructor(this.model.toJSON()),
                config: this.config
            });
            targetUrl = embedView.getUrl(true);

            window.open(targetUrl);
        }
    });

});
