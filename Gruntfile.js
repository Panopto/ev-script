'use strict';

module.exports = function(grunt) {

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    /*
     * Define grunt-requirejs config here since it doesn't seem to support task-level
     * configs w/ target-level overrides.  Using underscore to override dev options
     * for prod and pass these below in the requirejs section of initConfig.
     */
    var _ = require('lodash'),
        rjs_dev_opts = {
            almond: true,
            baseUrl: '.',
            deps: ['ev-script'],
            paths: {
                'ev-script': 'src/ev-script',
                'jquery': 'empty:',
                'jquery-ui': 'empty:',
                'jquery.cookie': 'node_modules/jquery.cookie/jquery.cookie',
                'jquery.plupload.queue': 'empty:',
                'jquery-expander': 'node_modules/jquery-expander/jquery.expander',
                'plupload': 'empty:',
                'ev-scroll-loader': 'node_modules/ev-scroll-loader/dist/jquery.ev-scroll-loader',
                'underscore': 'node_modules/underscore/underscore',
                'backbone': 'node_modules/backbone/backbone',
                'text': 'node_modules/requirejs-text/text',
                'json': 'node_modules/requirejs-json/json',
                'compare-versions': 'node_modules/compare-versions/index',
                'platform': 'node_modules/platform/platform',
                'base64': 'node_modules/Base64/base64',
                'cldr': 'node_modules/cldrjs/dist/cldr',
                'cldr-data': 'node_modules/cldr-data',
                'globalize': 'node_modules/globalize/dist/globalize',
                'moment': 'node_modules/moment/min/moment-with-locales',
                'urijs': 'node_modules/urijs/src',
                'loglevel': 'node_modules/loglevel/dist/loglevel',
                'select2': 'node_modules/select2/src/js',
                'jquery-mousewheel': 'node_modules/jquery-mousewheel/jquery.mousewheel',
                'oidc': 'node_modules/oidc-client/lib/oidc-client'
            },
            name: 'node_modules/almond/almond',
            out: 'dist/ev-script.js',
            wrap: {
                start: '<%= banner %>' + grunt.file.read('wrap/wrap.start'),
                end: grunt.file.read('wrap/wrap.end')
            },
            optimize: 'none'
        },
        rjs_prod_opts = _.extend({}, rjs_dev_opts, {
            out: 'dist/ev-script.min.js',
            optimize: 'uglify2',
            preserveLicenseComments: false,
            generateSourceMaps: true
        });

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/**\n' +
            ' * <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.title %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> Symphony Video, Inc.\n' +
            ' * Licensed <%= pkg.license %>\n' +
            ' */\n',
        // Task configuration.
        clean: ['dist'],
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js'],
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js']
            },
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile', 'requirejs:development']
            },
            src: {
                files: ['<%= jshint.src.src %>', 'src/**/*.html', 'src/**/*.json', 'wrap/*'],
                tasks: ['jshint:src', 'requirejs:development']
            },
            assets: {
                files: ['assets/less/*.less'],
                tasks: ['less']
            },
        },
        requirejs: {
            development: {
                options: rjs_dev_opts
            },
            production: {
                options: rjs_prod_opts
            }
        },
        less: {
            default: {
                files: {
                    'assets/css/ev-script.css': 'assets/less/ev-script.less'
                }
            }
        },
        copy: {
            i18n: {
                files: [{
                    expand: true,
                    cwd: 'src/ev-script',
                    src: ['i18n/**'],
                    dest: 'dist/'
                }]
            }
        }
    });

    var express = require('express'),
        serveStatic = require('serve-static'),
        serveIndex = require('serve-index'),
        logger = require('morgan'),
        errorhandler = require('errorhandler'),
        path = require('path'),
        https = require('https'),
        fs = require('fs'),
        url = require('url'),
        request = require('request'),
        settings = require('./ev-config.js').evSettings;

    grunt.registerTask('server', 'Demo server', function() {
        var port = 8000,
            base = path.resolve('.'),
            demo = path.join(base, 'demo');
        grunt.log.writeln('Starting ssl web server in "' + base + '" on port ' + port + '.');
        var app = express()
            .use(logger('combined'))
            .use('/certs', function(req, res) {
                grunt.log.writeln('Skipping request for certs...');
                res.send('');
            })
            .use(serveStatic(base))
            .use(serveIndex(base, {
                filter: function(filename, index, files, dir) {
                    return filename !== 'certs';
                }
            }))
            // Fallback for auth routing
            .use('/demo/auth/*', function(req, res) {
                grunt.log.writeln('Handling auth route: ' + req.originalUrl);
                res.sendFile(path.join(demo, 'index.html'));
            })
            .use(errorhandler());
        https.createServer({
            key: fs.readFileSync('certs/ev-script-key.pem'),
            cert: fs.readFileSync('certs/ev-script-cert.pem')
        }, app).listen(port);
    });

    // Default task.
    grunt.registerTask('default', ['clean', 'jshint', 'less', 'requirejs', 'copy:i18n']);
    grunt.registerTask('dev', ['clean', 'jshint', 'less', 'requirejs:development', 'copy:i18n']);
    grunt.registerTask('prod', ['clean', 'jshint', 'less', 'requirejs:production', 'copy:i18n']);
    grunt.registerTask('demo', ['server', 'watch']);

};