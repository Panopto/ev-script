/*global define*/
(function(root) {

    'use strict';

    // var ensembleUrl = 'https://cloud.ensemblevideo.com',
    var ensembleUrl = 'https://test01.ensemblevideo.com';

    var evSettings = {
        ensembleUrl: ensembleUrl,
        pageSize: 10,
        institutionId: '52AF905C-187A-4405-AB61-0BBEC3E7E62F',
        clientId: 'ev-lti-chooser',
        certConfig: [{ name: 'commonName', value: 'ensemblevideo.com' }]
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
