define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        DropboxEmbedView = require('ev-script/views/dropbox-embed');

    return PreviewView.extend({
        embedClass: DropboxEmbedView,
        render: function() {
            var embedView,
                targetUrl;
            if (this.info.checkVersion('<5.3.0')) {
                embedView = new DropboxEmbedView({
                    model: new this.model.constructor(this.model.toJSON())
                });
                targetUrl = embedView.getUrl(true);
                window.open(targetUrl);
            } else {
                PreviewView.prototype.render.call(this);
            }
        }
    });

});
