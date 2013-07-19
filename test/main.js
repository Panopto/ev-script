(function() {

    'use strict';

    QUnit.config.autostart = false;

    require.config({
        baseUrl: '../lib/bower',
        paths: {
            'ev-script': '../../src/ev-script',
            'ev-config': '../../ev-config',
            'ev-scroll-loader': '../ev-scroll-loader',
            'tests': '../../test/tests',
            'jquery':  'jquery/jquery',
            'jquery-ui': 'jquery-ui/jquery-ui',
            'jquery.cookie': 'jquery.cookie/jquery.cookie',
            'jquery.ui.plupload': 'plupload/js/jquery.ui.plupload/jquery.ui.plupload',
            'plupload': 'plupload/js/plupload.full',
            'text': 'text/text',
            'underscore': 'lodash/dist/lodash.underscore',
            'backbone': 'backbone/backbone'
        },
        shim: {
            'jquery': {
                exports: 'jQuery'
            },
            'jquery-ui': ['jquery'],
            'jquery.cookie': ['jquery'],
            'plupload': [],
            'jquery.ui.plupload': ['jquery', 'plupload'],
            'underscore': {
                exports: '_'
            },
            'backbone': {
                deps: ['jquery', 'underscore'],
                exports: 'Backbone'
            }
        }
    });

    var testModules = [
        // Load our shims here
        'jquery',
        'jquery-ui',
        'jquery.cookie',
        'underscore',
        'backbone',
        // Test modules
        'tests/auth/basic/auth',
        'tests/auth/basic/view',
        'tests/auth/forms/auth',
        // TODO - 'tests/auth/forms/view',
        'tests/util/cache',
        'tests/util/events',
        'tests/collections/base',
        'tests/collections/organizations',
        'tests/collections/libraries',
        'tests/collections/media-workflows',
        'tests/collections/playlists',
        'tests/collections/videos',
        'tests/collections/authsources',
        'tests/models/playlist-settings',
        'tests/models/video-settings',
        'tests/models/video-encoding',
        'tests/models/current-user',
        'tests/views/base',
        'tests/views/field'
    ];

    require(testModules, function() {
        QUnit.start();
    });

}());
