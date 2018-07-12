define(function(require) {

    'use strict';

    var _ = require('underscore'),
        $ = require('jquery'),
        ResultsView = require('ev-script/views/results'),
        DropboxSettings = require('ev-script/models/dropbox-settings'),
        DropboxPreviewView = require('ev-script/views/dropbox-preview');

    return ResultsView.extend({
        resultTemplate: _.template(require('text!ev-script/templates/dropbox-result.html')),
        initialize: function(options) {
            ResultsView.prototype.initialize.call(this, options);
        },
        refreshHandler: function(e) {
            e.preventDefault();
            this.events.trigger('reload', 'dropboxes');
        },
        getPreviewInstance: function(previewOptions) {
            return new DropboxPreviewView(previewOptions);
        }
    });

});
