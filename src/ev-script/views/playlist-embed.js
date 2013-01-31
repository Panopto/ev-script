/*global define*/
define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseView = require('ev-script/views/base');

    return BaseView.extend({
        template: _.template(require('text!ev-script/templates/playlist-embed.html')),
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            this.$el.html(this.template({
                modelId: this.model.get('id'),
                ensembleUrl: this.config.ensembleUrl
            }));
        }
    });

});
