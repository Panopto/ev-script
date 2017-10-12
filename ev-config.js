/*global define*/
(function(root) {

    'use strict';

    // var ensembleUrl = 'https://cloud.ensemblevideo.com',
    var ensembleUrl = 'https://jmpease-pc:8082',
        proxyPath = '/ensemble';

    var evSettings = {
        ensembleUrl: ensembleUrl,
        authPath: '/',
        pageSize: 10,
        proxyPath: proxyPath,
        // urlCallback: function(url) {
        //     return proxyPath + '?ensembleUrl=' + encodeURIComponent(ensembleUrl) + '&request=' + encodeURIComponent(url);
        // },
        pluploadFlashPath: '/node_modules/plupload/js/Moxie.swf',
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
