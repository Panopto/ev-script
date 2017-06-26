define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        messages = require('i18n!ev-script/nls/messages'),
        ResultsView = require('ev-script/views/results'),
        VideoSettings = require('ev-script/models/video-settings'),
        VideoPreviewView = require('ev-script/views/video-preview');

    require('jquery-truncate-html');

    return ResultsView.extend({
        modelClass: VideoSettings,
        previewClass: VideoPreviewView,
        resultTemplate: _.template(require('text!ev-script/templates/video-result.html')),
        initialize: function(options) {
            ResultsView.prototype.initialize.call(this, options);
        },
        decorate: function($item) {
            // Handle truncation (more/less) of truncatable fields
            $('.trunc .value', $item).each(function(element) {
                var $this = $(this),
                    $full,
                    $short,
                    truncLen = 100,
                    fullText = $this.data('fullText') || $this.html(),
                    truncText = $.truncate(fullText, {
                        length: truncLen,
                        stripTags: true,
                        noBreaks: true
                    });
                $this.empty();
                if ($(window).width() < 1100 && fullText.length > truncLen) {
                    $this.data('fullText', fullText);
                    $full = $('<span>' + fullText + '</span>');
                    $short = $('<span>' + truncText + '</span>');
                    var $shorten = $('<a href="#">' + messages['Less'] + '</a>').click(function(e) {
                        $full.hide();
                        $short.show();
                        e.preventDefault();
                    });
                    var $expand = $('<a href="#">' + messages['More'] + '</a>').click(function(e) {
                        $short.hide();
                        $full.show();
                        e.preventDefault();
                    });
                    $full.hide().append($shorten);
                    $short.append($expand);
                    $this.append($short).append($full);
                } else {
                    $this.append(fullText);
                }
            });
        },
        refreshHandler: function(e) {
            e.preventDefault();
            this.appEvents.trigger('reloadVideos');
        }
    });

});
