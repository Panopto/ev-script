/*global define*/
define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        PlaylistEmbedView = require('ev-script/views/playlist-embed');

    return PreviewView.extend({
        initialize: function(options) {
            PreviewView.prototype.initialize.call(this, options);
        },
        embedClass: PlaylistEmbedView
    });

});
