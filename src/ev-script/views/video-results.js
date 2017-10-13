define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        ResultsView = require('ev-script/views/results'),
        VideoSettings = require('ev-script/models/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview');

    require('jquery-expander');

    return ResultsView.extend({
        modelClass: VideoSettings,
        previewClass: VideoPreviewView,
        resultTemplate: _.template(require('text!ev-script/templates/video-result.html')),
        initialize: function(options) {
            ResultsView.prototype.initialize.call(this, options);
        },
        decorate: function($item) {
            ResultsView.prototype.decorate.call(this, $item);

            // Handle truncation (more/less) of truncatable fields
            if ($(window).width() < 1100) {
                $('.trunc .value', $item).each(_.bind(function(index, element) {
                    var $element = $(element);
                    $element.expander({
                        'expandText': this.i18n.formatMessage('More'),
                        'userCollapseText': this.i18n.formatMessage('Less'),
                    });
                }, this));
            }
        },
        refreshHandler: function(e) {
            e.preventDefault();
            this.appEvents.trigger('reloadVideos');
        }
    });

});
