define(function(require) {

    'use strict';

    var _ = require('underscore'),
        BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        initialize: function(attributes, options) {
            BaseModel.prototype.initialize.call(this, attributes, options);
        },
        // url: function() {
        //     var url = this.config.ensembleUrl + '/api/CurrentUser';
        //     return this.config.urlCallback ? this.config.urlCallback(url) : url;
        // },
        // parse: function(response) {
        //     return response.Data[0];
        // }
    });

});
