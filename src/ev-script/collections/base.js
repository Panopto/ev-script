/*global define*/
define(function(require) {

    'use strict';

    var Backbone = require('backbone');

    return Backbone.Collection.extend({
        initialize: function(models, options) {
            this.app = options.app;
        },
        model: Backbone.Model.extend({
            idAttribute: 'ID'
        }),
        parse: function(response) {
            return response.Data;
        }
    });

});
