/*global define*/
define(function(require) {

    'use strict';

    var BaseView = require('ev-script/views/base');

    return BaseView.extend({
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            var html =
                '<iframe src="' + this.config.ensembleUrl +
                '/app/plugin/embed.aspx?DestinationID=' + this.model.get('id') +
                '" frameborder="0" style="width:800px;height:850px;" allowfullscreen></iframe>';
            this.$el.html(html);
        }
    });

});
