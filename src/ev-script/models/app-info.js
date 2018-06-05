define(function(require) {

    'use strict';

    var _ = require('underscore'),
        semver = require('semver'),
        BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        initialize: function(attributes, options) {
            BaseModel.prototype.initialize.call(this, attributes, options);
        },
        parse: function(response) {
            return response;
        },
        checkVersion: function(condition) {
            var version = this.get('applicationVersion');
            return version && semver.satisfies(version, condition);
        }
    });

});
