define(function(require) {

    'use strict';

    var configs = [];

    return {
        setConfig: function(appId, config) {
            configs[appId] = config;
        },
        getConfig: function(appId) {
            return configs[appId];
        }
    };

});
