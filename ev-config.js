/*global define*/
(function(root) {

    'use strict';

    var evSettings = {
        ensembleUrl: 'https://cloud.ensemblevideo.com/ensemble',
        authId: 'cloud',
        authPath: '/',
        pageSize: 10,
        proxyPath: '/ensemble'
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
