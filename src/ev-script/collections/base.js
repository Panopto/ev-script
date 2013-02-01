define(function(require) {

    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        configUtil = require('ev-script/util/config');

    return Backbone.Collection.extend({
        initialize: function(models, options) {
            this.appId = options.appId;
            this.config = configUtil.getConfig(this.appId);
        },
        model: Backbone.Model.extend({
            idAttribute: 'ID'
        }),
        parse: function(response) {
            return response.Data;
        }
    });

});
