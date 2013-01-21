/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> Symphony Video, Inc.;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['src/**/*.js', 'test/**/*.js']
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
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  var connect = require('connect'),
      path = require('path'),
      https = require('https'),
      fs = require('fs'),
      url = require('url'),
      request = require('request'),
      settings = require('./demo/config.js').evSettings;

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

  grunt.registerTask('server', 'Demo server w/ Ensemble Video "proxying".', function() {
    var port = 8000, base = path.resolve('.');
    grunt.log.writeln('Starting ssl web server in "' + base + '" on port ' + port + '.');
    var app = connect()
      .use(connect.logger())
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
            apiUrl = apiUrl.replace(/http(s)?:\/\//, 'http$1://' +  username + ':' + password + '@');
          }
          request.get(apiUrl, function(error, response, body) {
            delete response.headers['www-authenticate'];
            res.headers = response.headers;
            res.statusCode = response.statusCode;
            res.end(response.body);
          });
        }
      });
    https.createServer({
      key: fs.readFileSync('assets/ssl/certs/ev-script-key.pem'),
      cert: fs.readFileSync('assets/ssl/certs/ev-script-cert.pem')
    }, app).listen(port);
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  grunt.registerTask('demo', ['server', 'watch']);

};
