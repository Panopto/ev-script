/*global define*/
(function(root) {

    'use strict';

    // var ensembleUrl = 'https://cloud.ensemblevideo.com',
    var ensembleUrl = 'https://test01.ensemblevideo.com';

    var evSettings = {
        ensembleUrl: ensembleUrl,
        pageSize: 10,
        pluploadFlashPath: '/node_modules/plupload/js/Moxie.swf',
        defaultProvider: 'fd2ea5b3-ba4c-424c-b9d4-b179c1fe46f7' //'737357F1-93E0-4BA6-9868-3D9CA0703E4B'
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
