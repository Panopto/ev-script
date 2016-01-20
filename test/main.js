(function() {

    'use strict';

    QUnit.config.autostart = false;

    require.config({
        baseUrl: '../bower_components',
        paths: {
            'ev-script': '../../src/ev-script',
            'ev-config': '../../ev-config',
            'ev-scroll-loader': 'ev-scroll-loader/dist/jquery.ev-scroll-loader',
            'test': '../../test',
            'jquery':  'jquery/dist/jquery',
            'jquery-ui': 'jquery-ui/jquery-ui',
            'jquery.cookie': 'jquery.cookie/jquery.cookie',
            'jquery.plupload.queue': 'plupload/js/jquery.plupload.queue/jquery.plupload.queue',
            'moxie': 'plupload/js/moxie',
            'plupload': 'plupload/js/plupload.dev',
            'text': 'text/text',
            'underscore': 'underscore/underscore',
            'backbone': 'backbone/backbone'
        },
        shim: {
            'moxie': [],
            'plupload': ['moxie'],
            'jquery.plupload.queue': ['jquery', 'plupload']
        }
    });

    var testModules = [
        // Load our shims here
        // 'jquery',
        // 'jquery-ui',
        // 'jquery.cookie',
        // 'underscore',
        // 'backbone',
        // Test modules
        'test/tests/auth/basic/auth',
        'test/tests/auth/basic/view',
        'test/tests/auth/forms/auth',
        // TODO - 'tests/auth/forms/view',
        'test/tests/auth/none/auth',
        'test/tests/auth/none/view',
        'test/tests/util/cache',
        'test/tests/util/events',
        'test/tests/collections/base',
        'test/tests/collections/organizations',
        'test/tests/collections/libraries',
        'test/tests/collections/media-workflows',
        'test/tests/collections/playlists',
        'test/tests/collections/videos',
        'test/tests/collections/identity-providers',
        'test/tests/models/playlist-settings',
        'test/tests/models/video-settings',
        'test/tests/models/video-encoding',
        'test/tests/models/current-user',
        'test/tests/views/base',
        'test/tests/views/field'
    ];

    require(testModules, function() {
        QUnit.start();
    });

}());
