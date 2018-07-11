define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        DropboxEmbedView = require('ev-script/views/dropbox-embed');

    return PreviewView.extend({
        render: function() {
            var embedView = new DropboxEmbedView({
                    model: new this.model.constructor(this.model.toJSON())
                }),
                targetUrl = embedView.getUrl();
            window.open(targetUrl);
        }
    });

});
