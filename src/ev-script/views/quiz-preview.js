define(function(require) {

    'use strict';

    var PreviewView = require('ev-script/views/preview'),
        QuizEmbedView = require('ev-script/views/quiz-embed');

    return PreviewView.extend({
        embedClass: QuizEmbedView
    });

});
