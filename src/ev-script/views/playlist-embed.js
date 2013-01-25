/*global define*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone');

    return Backbone.View.extend({
        initialize: function(options) {
            var html =
                '<iframe src="' + options.config.ensembleUrl +
                '/app/plugin/embed.aspx?DestinationID=' + this.model.get('id') +
                '" frameborder="0" style="width:800px;height:850px;" allowfullscreen></iframe>';
            this.$el.html(html);
        }
    });

});
