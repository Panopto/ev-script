'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner:
            '/**\n' +
            ' * <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.title %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> Symphony Video, Inc.\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n',
        // Task configuration.
        clean: ['dist'],
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['src/**/*.js', 'test/**/*.js']
            },
            options: {
                jshintrc: '.jshintrc'
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', /*'qunit',*/ 'requirejs:development']
            }
        },
        requirejs: {
            // FIXME - it doesn't appear that grunt-requirejs supports task-level options?
            development: {
                options: {
                    almond: true,
                    baseUrl: 'lib/bower',
                    paths: {
                        'ev-script': '../../src/ev-script',
                        'jquery':  'jquery/jquery',
                        'underscore': 'lodash/lodash',
                        'backbone': 'backbone/backbone'
                    },
                    name: 'ev-script',
                    exclude: ['jquery', 'backbone', 'underscore'],
                    out: "dist/ev-script.js",
                    wrap: {
                        start: '<%= banner %>' + grunt.file.read('wrap/wrap.start'),
                        end: grunt.file.read('wrap/wrap.end')
                    },
                    optimize: 'none'
                }
            },
            production: {
                options: {
                    almond: true,
                    baseUrl: 'lib/bower',
                    paths: {
                        'ev-script': '../../src/ev-script',
                        'jquery':  'jquery/jquery',
                        'underscore': 'lodash/lodash',
                        'backbone': 'backbone/backbone'
                    },
                    name: 'ev-script',
                    exclude: ['jquery', 'backbone', 'underscore'],
                    out: "dist/ev-script.min.js",
                    wrap: {
                        start: '<%= banner %>' + grunt.file.read('wrap/wrap.start'),
                        end: grunt.file.read('wrap/wrap.end')
                    }
                }
            }
        }
    });

    var connect = require('connect'),
        path = require('path'),
        https = require('https'),
        fs = require('fs'),
        url = require('url'),
        request = require('request'),
        settings = require('./demo/js/config.js').evSettings;

    /*
     * Browsers don't handle cross-domain basic auth and hacks like JSONP don't
     * provide access to response headers (like status code), so we're proxying
     * and using cookies to pass basic auth credentials in our API request url.
     * This also helps in that the basic auth form can confuse users if I try to
     * use a proper reverse proxy. In that case, the user will see a basic auth
     * prompt to authenticate against the current domain, when they're really being
     * asked to provide EV creds.
     *
     * The EV script needs to know the EV url...but I can't directly call the url
     * via AJAX due to browser restrictions (same origin policy).  So I have a callback
     * that rewrites the url to point to a local "proxy" endpoint passing the original
     * request url as a parameter.  Leveraging cookies from the auth form along w/
     * the url parameter the proxy handles the API request (and strips basic auth
     * headers in the event of auth failure so as not to prompt for basic auth).
     */

    // FIXME - move to external file
    grunt.registerTask('server', 'Demo server w/ Ensemble Video "proxying".', function() {
        var port = 8000,
            base = path.resolve('.');
        grunt.log.writeln('Starting ssl web server in "' + base + '" on port ' + port + '.');
        var app = connect()
        //.use(connect.logger())
        .use(connect.cookieParser())
        .use(connect['static'](base))
        .use(connect.directory(base))
        .use(function(req, res) {
            var parsed = url.parse(req.url, true);
            if (parsed.pathname === settings.proxyPath) {
                var authId = parsed.query.authId,
                    apiUrl = parsed.query.request,
                    username = req.cookies[authId + '-user'],
                    password = req.cookies[authId + '-pass'];
                if (username && password) {
                    apiUrl = apiUrl.replace(/http(s)?:\/\//, 'http$1://' + username + ':' + password + '@');
                }
                request.get({ url: apiUrl }, function(error, response, body) {
                    if (!error) {
                        delete response.headers['www-authenticate'];
                        res.headers = response.headers;
                        res.statusCode = response.statusCode;
                        res.end(body);
                    }
                });
            }
        });
        https.createServer({
            key: fs.readFileSync('assets/ssl/certs/ev-script-key.pem'),
            cert: fs.readFileSync('assets/ssl/certs/ev-script-cert.pem')
        }, app).listen(port);
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-requirejs');

    // Default task.
    grunt.registerTask('default', ['clean', 'jshint', 'requirejs:development', 'requirejs:production'/*, 'qunit'*/]);
    grunt.registerTask('dev', ['clean', 'jshint', /*'qunit',*/ 'requirejs:development']);
    grunt.registerTask('prod', ['clean', 'jshint', /*'qunit',*/ 'requirejs:production']);
    grunt.registerTask('demo', ['server', 'watch']);

};
