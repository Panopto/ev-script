define(function(require) {

    'use strict';

    var _ = require('underscore'),
        $ = require('jquery'),
        URITemplate = require('urijs/URITemplate'),
        ResultsView = require('ev-script/views/results'),
        QuizSettings = require('ev-script/models/quiz-settings'),
        QuizPreviewView = require('ev-script/views/quiz-preview');

    return ResultsView.extend({
        resultTemplate: _.template(require('text!ev-script/templates/quiz-result.html')),
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
            item.getComments = function() {
                return _.unescape(item.get('comments'));
            };
            return ResultsView.prototype.getItemHtml.call(this, item, index);
        },
        refreshHandler: function(e) {
            e.preventDefault();
            this.events.trigger('reload', 'quizzes');
        },
        getPreviewInstance: function(previewOptions) {
            return new QuizPreviewView(previewOptions);
        }
    });

});
