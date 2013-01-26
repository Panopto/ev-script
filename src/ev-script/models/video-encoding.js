/*global define*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: 'videoID',
        initialize: function(attributes, options) {
            this.app = options.app;
        },
        url: function() {
            return this.app.config.ensembleUrl + '/app/api/content/show.json/' + this.get('fetchId');
        },
        getDims: function() {
            var dimsStrs = this.get('dimensions').split('x');
            var dims = [];
            dims[0] = parseInt(dimsStrs[0], 10);
            dims[1] = parseInt(dimsStrs[1], 10);
            return dims;
        },
        getRatio: function() {
            var dims = this.getDims();
            return dims[0] / dims[1];
        },
        getWidth: function() {
            return this.getDims()[0];
        },
        getHeight: function() {
            return this.getDims()[1];
        },
        parse: function(response) {
            return response.dataSet.encodings;
        }
    });

});
