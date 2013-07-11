'use strict';

module.exports = function(grunt) {

    /*
     * Define grunt-requirejs config here since it doesn't seem to support task-level
     * configs w/ target-level overrides.  Using underscore to override dev options
     * for prod and pass these below in the requirejs section of initConfig.
     */
    var _ = require('lodash'),
        rjs_dev_opts = {
            almond: true,
            baseUrl: 'lib/bower',
            paths: {
                'ev-script': '../../src/ev-script',
                'jquery':  'jquery/jquery',
                'jquery-ui': 'jquery-ui/jquery-ui',
                'jquery.cookie': 'jquery.cookie/jquery.cookie',
                'ev-scroll-loader': '../ev-scroll-loader',
                'underscore': 'lodash/dist/lodash.underscore',
                'backbone': 'backbone/backbone',
                'text': 'text/text'
            },
            name: 'ev-script',
            exclude: ['jquery', 'jquery-ui', 'jquery.cookie', 'backbone', 'underscore'],
            out: "dist/ev-script.js",
            wrap: {
                start: '<%= banner %>' + grunt.file.read('wrap/wrap.start'),
                end: grunt.file.read('wrap/wrap.end')
            },
            optimize: 'none'
        },
        rjs_prod_opts = _.extend({}, rjs_dev_opts, {
            out: "dist/ev-script.min.js",
            optimize: 'uglify'
        });

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
            all: {
                options: {
                    urls: ['https://localhost:8000/test'],
                    '--ignore-ssl-errors': true,
                    timeout: 240000
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: ['<%= jshint.lib_test.src %>', 'src/**/*.html', 'wrap/*'],
                tasks: ['jshint:lib_test', /*'qunit',*/ 'requirejs:development']
            }
        },
        requirejs: {
            development: {
                options: rjs_dev_opts
            },
            production: {
                options: rjs_prod_opts
            }
        },
        compass: {
            default: {
                options: {
                    sassDir: 'assets/sass',
                    cssDir: 'assets/css',
                    require: ['compass-normalize']
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
        settings = require('./ev-config.js').evSettings;

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
     * the url parameter the proxy handles the API request (and strips any basic auth
     * header from the response in the event of auth failure so as not to prompt
     * for basic auth).
     */

    // TODO - move to external file?
    grunt.registerTask('server', 'Demo server w/ Ensemble Video "proxying".', function() {
        var port = 8000,
            base = path.resolve('.');
        grunt.log.writeln('Starting ssl web server in "' + base + '" on port ' + port + '.');
        var app = connect()
        // .use(connect.logger())
        .use(connect.urlencoded())
        .use(connect.cookieParser())
        .use(connect['static'](base))
        .use(connect.directory(base))
        .use(function(req, res) {
            var parsed = url.parse(req.url, true);
            // Proxy for EV API requests
            if (parsed.pathname === settings.proxyPath) {
                var ensembleUrl = parsed.query.ensembleUrl,
                    apiUrl = parsed.query.request,
                    username = req.cookies[encodeURIComponent(ensembleUrl) + '-user'],
                    password = req.cookies[encodeURIComponent(ensembleUrl) + '-pass'];
                if (apiUrl) {
                    if (username && password) {
                        apiUrl = apiUrl.replace(/http(s)?:\/\//, 'http$1://' + encodeURIComponent(username) + ':' + encodeURIComponent(password) + '@');
                    }
                    request.get({ url: apiUrl }, function(error, response, body) {
                        if (!error) {
                            delete response.headers['www-authenticate'];
                            res.headers = response.headers;
                            res.statusCode = response.statusCode;
                            res.end(body);
                        }
                    });
                } else {
                    res.statusCode = 400;
                    res.end("Missing request parameter.");
                }
            }
            // LTI demo launch path
            else if (parsed.pathname === '/demo/lti/launch' && req.method === 'POST') {
                // console.log(req);
                var returnUrl = req.body.launch_presentation_return_url;
                // We're just doing a simple redirect here
                res.writeHead(302, {
                    'Location': 'https://' + req.headers['host'] + '/demo/lti/index.html?return_url=' + encodeURIComponent(returnUrl)
                });
                res.end();
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
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-requirejs');

    // Default task.
    grunt.registerTask('test', ['server', 'qunit']);
    grunt.registerTask('default', ['clean', 'jshint', 'compass', 'test', 'requirejs:development', 'requirejs:production']);
    grunt.registerTask('dev', ['clean', 'jshint', 'compass', 'test', 'requirejs:development']);
    grunt.registerTask('prod', ['clean', 'jshint', 'compass', 'test', 'requirejs:production']);
    grunt.registerTask('demo', ['server', 'watch']);

};
