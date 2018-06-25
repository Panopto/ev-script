define(function(require) {

    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        URITemplate = require('urijs/URITemplate'),
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
        getItemHtml: function(item, index) {
            var branding = this.root.getEmbedded('ev:Brandings/Current');
            item.getThumbnailUrl = function() {
                var thumbnailLink = item.getLink('ev:Images/Thumbnail'),
                    thumbnailTemplate = thumbnailLink ? thumbnailLink.href : branding.get('thumbnailImageUrlTemplate');
                return new URITemplate(thumbnailTemplate).expand({
                    width: 200,
                    height: 112
                });
            };
            item.getDescription = function() {
                return _.unescape(item.get('description'));
            };
            item.getKeywords = function() {
                return _.unescape(item.get('keywords'));
            };
            return ResultsView.prototype.getItemHtml.call(this, item, index);
        },
        decorate: function($item) {
            // Handle truncation (more/less) of truncatable fields
            if ($(window).width() < 1100) {
                $('.trunc .value', $item).each(_.bind(function(index, element) {
                    var $element = $(element),
                        setFocus = function() {
                            $item.focus();
                        };
                    $element.expander({
                        'expandText': this.i18n.formatMessage('More'),
                        'userCollapseText': this.i18n.formatMessage('Less'),
                        'afterExpand': setFocus,
                        'afterCollapse': setFocus
                    });
                }, this));
            }
            // Call our base impl
            ResultsView.prototype.decorate.call(this, $item);
        },
        refreshHandler: function(e) {
            e.preventDefault();
            this.appEvents.trigger('reloadVideos');
        }
    });

});
