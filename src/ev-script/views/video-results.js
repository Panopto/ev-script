/*global define*/
define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        ResultsView = require('ev-script/views/results'),
        VideoSettings = require('ev-script/models/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview');

    return ResultsView.extend({
        modelClass: VideoSettings,
        previewClass: VideoPreviewView,
        resultTemplate: _.template(require('text!ev-script/templates/video-result.html')),
        initialize: function(options) {
            ResultsView.prototype.initialize.call(this, options);
        },
        decorate: function($item) {
            // Handle truncation (more/less) of description text
            $('.desc .value', $item).each(function(element) {
                var $this = $(this), $full, $short, truncLen = 100, fullDesc = $(this).html();
                if (fullDesc.length > truncLen) {
                    $this.empty();
                    $full = $('<span>' + fullDesc + '</span>');
                    $short = $('<span>' + fullDesc.substring(0, truncLen) + '...</span>');
                    var $shorten = $('<a href="#">Less</a>').click(function(e) {
                        $full.hide();
                        $short.show();
                        e.preventDefault();
                    });
                    var $expand = $('<a href="#">More</a>').click(function(e) {
                        $short.hide();
                        $full.show();
                        e.preventDefault();
                    });
                    $full.hide().append($shorten);
                    $short.append($expand);
                    $this.append($short).append($full);
                }
            });
        }
    });

});
