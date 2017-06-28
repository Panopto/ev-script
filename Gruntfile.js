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
        'jquery.cookie': 'bower_components/jquery.cookie/jquery.cookie',
        'jquery.plupload.queue': 'empty:',
        'jquery-truncate-html': 'bower_components/jquery-truncate-html/jquery.truncate',
        'plupload': 'empty:',
        'ev-scroll-loader': 'bower_components/ev-scroll-loader/dist/jquery.ev-scroll-loader',
        'underscore': 'bower_components/underscore/underscore',
        'backbone': 'bower_components/backbone/backbone',
        'text': 'bower_components/requirejs-text/text',
        'json': 'bower_components/requirejs-json/json',
        'semver': 'bower_components/semver/semver.browser',
        'platform': 'bower_components/platform.js/platform',
        'base64': 'bower_components/base64/base64',
        'cldr': 'bower_components/cldrjs/dist/cldr',
        'cldr-data': 'bower_components/cldr-data',
        'globalize': 'bower_components/globalize/dist/globalize',
      },
      name: 'bower_components/almond/almond',
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
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },
    qunit: {
      all: {
        options: {
          urls: ['https://localhost:8000/test'],
          '--ignore-ssl-errors': true,
          '--cookies-file': 'cookie-jar.txt',
          '--web-security': false,
          timeout: 60000
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile', 'requirejs']
      },
      src: {
        files: ['<%= jshint.src.src %>', 'src/**/*.html', 'wrap/*'],
        tasks: ['jshint:src', /*'qunit',*/ 'requirejs']
      },
      test: {
        files: ['<%= jshint.test.src %>'],
        tasks: ['jshint:test']
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
    }
  });

  var connect = require('connect'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
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
      // .use(logger('combined'))
      .use(bodyParser.urlencoded({
        extended: true
      }))
      .use(cookieParser())
      .use(serveStatic(base))
      .use(serveIndex(base))
      .use(function(req, res) {
        var parsed = url.parse(req.url, true);
        // Proxy for EV API requests
        if (parsed.pathname === settings.proxyPath) {
          var ensembleUrl = parsed.query.ensembleUrl,
            apiUrl = parsed.query.request,
            username = req.cookies[encodeURIComponent(ensembleUrl) + '-user'],
            password = req.cookies[encodeURIComponent(ensembleUrl) + '-pass'];
          // console.log('ensembleUrl: ' + ensembleUrl);
          // console.log('apiUrl: ' + apiUrl);
          // console.log('cookies: ' + JSON.stringify(req.cookies));
          // console.log('username: ' + username);
          // console.log('password: ' + password);
          if (apiUrl) {
            var opts = {
              url: apiUrl,
              strictSSL: false
            };
            if (username && password) {
              _.extend(opts, {
                auth: {
                  username: username,
                  password: password
                }
              });
            }
            var r = request.get(opts);
            r.pipefilter = function(response, dest) {
              dest.removeHeader('www-authenticate');
            };
            r.pipe(res);
          } else {
            res.statusCode = 400;
            res.end('Missing request parameter.');
          }
        }
        // LTI demo launch path
        else if (parsed.pathname === '/demo/lti/launch' && req.method === 'POST') {
          console.log(req);
          var returnUrl = req.body.launch_presentation_return_url;
          // We're just doing a simple redirect here
          res.writeHead(302, {
            'Location': 'https://' + req.headers['host'] + '/demo/lti/index.html?return_url=' + encodeURIComponent(returnUrl)
          });
          res.end();
        }
      })
      .use(errorhandler());
    https.createServer({
      key: fs.readFileSync('assets/ssl/certs/ev-script-key.pem'),
      cert: fs.readFileSync('assets/ssl/certs/ev-script-cert.pem')
    }, app).listen(port);
  });

  // Default task.
  grunt.registerTask('test', ['server', 'qunit']);
  grunt.registerTask('default', ['clean', 'jshint', 'less', 'test', 'requirejs']);
  grunt.registerTask('all', ['clean', 'jshint', 'less', 'test', 'requirejs']);
  grunt.registerTask('all-skip-tests', ['clean', 'jshint', 'less', 'requirejs']);
  grunt.registerTask('dev', ['clean', 'jshint', 'less', 'test', 'requirejs:development']);
  grunt.registerTask('prod', ['clean', 'jshint', 'less', 'test', 'requirejs:production']);
  grunt.registerTask('demo', ['server', 'watch']);

};
