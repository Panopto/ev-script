define(function(require) {

    'use strict';

    var _ = require('underscore'),
        URI = require('urijs/URI'),
        EmbedView = require('ev-script/views/embed');

    return EmbedView.extend({
        template: _.template(require('text!ev-script/templates/quiz-embed.html')),
        initialize: function(options) {

            _.bindAll(this, 'render', 'getUrl');

            EmbedView.prototype.initialize.call(this, options);
        },
        getUrl: function(isPreview) {
            var key = this.model.get('content').key,
                url = URI(this.config.ensembleUrl);

            url.path('/hapi/v1/quiz/' + key + (isPreview ? '/preview' : '/launch'));
            url.addQuery({
                'displayTitle': this.model.get('showtitle'),
                'displayAttachments': this.model.get('attachments'),
                'displayLinks': this.model.get('links'),
                'displayMetaData': this.model.get('metadata'),
                'displayCredits': this.model.get('metadata'),
                'showCaptions': this.model.get('showcaptions')
            });
            return url;
        },
        render: function(isPreview) {
            this.$el.html(this.template({
                'src': this.getUrl(isPreview),
                'title': this.model.get('content').title
            }));
        }
    });

});
