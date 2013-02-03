define(function(require) {

    'use strict';

    var _ = require('underscore'),
        Backbone = require('backbone'),
        cacheUtil = require('ev-script/util/cache');

    return Backbone.Collection.extend({
        initialize: function(models, options) {
            this.appId = options.appId;
            this.config = cacheUtil.getAppConfig(this.appId);
        },
        model: Backbone.Model.extend({
            idAttribute: 'ID'
        }),
        parse: function(response) {
            return response.Data;
        }
    });

});
