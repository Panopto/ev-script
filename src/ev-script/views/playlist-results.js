define(function(require) {

    'use strict';

    var _ = require('underscore'),
        $ = require('jquery'),
        ResultsView = require('ev-script/views/results'),
        PlaylistSettings = require('ev-script/models/playlist-settings'),
        PlaylistPreviewView = require('ev-script/views/playlist-preview');

    return ResultsView.extend({
        resultTemplate: _.template(require('text!ev-script/templates/playlist-result.html')),
        initialize: function(options) {
            ResultsView.prototype.initialize.call(this, options);
        },
        refreshHandler: function(e) {
            e.preventDefault();
            this.events.trigger('reloadPlaylists');
        },
        getPreviewInstance: function(selectedItem, previewOptions) {
            return new PlaylistPreviewView(_.extend(previewOptions, {

                // TODO - this is copied from videos impl...obviously not
                // correct here

                // href: selectedItem.getLink('ev:Encodings/Default').href,
                // model: new PlaylistSettings({
                //     id: selectedItem.get('id'),
                //     content: selectedItem.toJSON()
                // })
            }));
        }
    });

});
