define(function(require) {

    'use strict';

    var _ = require('underscore'),
        compareVersions = require('compare-versions'),
        BaseModel = require('ev-script/models/base');

    return BaseModel.extend({
        checkVersion: function(target, condition) {
            var version = this.get('applicationVersion');
            return version && compareVersions.compare(version, target, condition);
        }
    });

});
