/*global define*/
(function(root) {

    'use strict';

    // var ensembleUrl = 'https://cloud.ensemblevideo.com',
    var ensembleUrl = 'http://71.176.124.143:8081',
        proxyPath = '/ensemble';

    var evSettings = {
        ensembleUrl: ensembleUrl,
        authPath: '/',
        pageSize: 10,
        proxyPath: proxyPath,
        // urlCallback: function(url) {
        //     return proxyPath + '?ensembleUrl=' + encodeURIComponent(ensembleUrl) + '&request=' + encodeURIComponent(url);
        // },
        // Used during testing
        // testUser: 'hasp',
        // testPass: 'hasp'
        testUser: 'admin',
        testPass: 'admin',
        authType: 'forms'
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
