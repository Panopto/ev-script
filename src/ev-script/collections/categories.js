define(function(require) {

    'use strict';

    var Backbone = require('backbone'),
        BaseCollection = require('ev-script/collections/legacy-base'),
        _ = require('underscore');

    return BaseCollection.extend({
        initialize: function(models, options) {
            BaseCollection.prototype.initialize.call(this, models, options);
            this.playlistId = options.playlistId || '';
        },
        url: function() {
            return this.config.ensembleUrl + '/app/api/category/list.json/' + this.playlistId;
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
