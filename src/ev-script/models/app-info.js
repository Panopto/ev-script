define(function(require) {

    'use strict';

    var _ = require('underscore'),
        semver = require('semver'),
        BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        initialize: function(attributes, options) {
            BaseModel.prototype.initialize.call(this, attributes, options);
            this.requiresAuth = false;
        },
        url: function() {
            var url = this.config.ensembleUrl + '/api/Info';
            return this.config.urlCallback ? this.config.urlCallback(url) : url;
        },
        parse: function(response) {
            return response;
        },
        checkVersion: function(condition) {
            var version = this.get('ApplicationVersion');
            return version && semver.satisfies(version, condition);
        },
        useLegacyEmbeds: function() {
            return this.checkVersion('<3.12.0');
        }
    });

});
