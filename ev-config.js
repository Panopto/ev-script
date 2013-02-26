/*global define*/
(function(root) {

    'use strict';

    var authId = 'cloud',
        proxyPath = '/ensemble';

    var evSettings = {
        ensembleUrl: 'https://cloud.ensemblevideo.com',
        authId: authId,
        authPath: '/',
        pageSize: 10,
        proxyPath: proxyPath,
        urlCallback: function(url) {
            return proxyPath + '?authId=' + authId + '&request=' + encodeURIComponent(url);
        },
        // Used during testing
        testUser: 'hasp',
        testPass: 'hasp'
    };

    if (typeof define === 'function' && define.amd) {
        // AMD.
        define([], function() {
            return evSettings;
        });
    } else if (typeof exports !== 'undefined') {
        exports.evSettings = evSettings;
    } else {
        root.evSettings = evSettings;
    }

}(this));
