define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        QuizEmbedView = require('ev-script/views/quiz-embed');

    return PreviewView.extend({
        embedClass: QuizEmbedView,
        render: function() {
            var embedView = new QuizEmbedView({
                    model: new this.model.constructor(this.model.toJSON())
                }),
                targetUrl = embedView.getUrl(this.model.get('width'), this.model.get('height'), true);
            window.open(targetUrl);
        }
    });

});
