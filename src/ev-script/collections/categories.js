define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/base'),
        _ = require('underscore');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.requiresAuth = false;
            this.playlistId = options.playlistId || '';
        },
        url: function() {
            var url = this.config.ensembleUrl + '/app/api/category/list.json/' + this.playlistId;
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        },
        parse: function(response) {
            return response.dataSet ? (response.dataSet.category || []) : [];
        },
        sync: function(method, model, options) {
            _.extend(options, {
                dataFilter: function(data) {
                    // Strip padding from JSONP response
                    var match = data.match(/\{[\s\S]*\}/);
                    return match ? match[0] : data;
                }
            });
            return Backbone.sync.call(this, method, model, options);
        }
    });

});
