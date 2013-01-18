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
      proxy = require('http-proxy'),
      options = {
        port: 8000,
        https: {
          key: fs.readFileSync('assets/ssl/certs/ev-script-key.pem'),
          cert: fs.readFileSync('assets/ssl/certs/ev-script-cert.pem')
        },
        target: {
          https: true
        },
        router: {
          'localhost/ensemble': 'cloud-test.ensemblevideo.com',
          'localhost/demo': 'localhost:8001/demo',
          'localhost/src': 'localhost:8001/src',
          'localhost/assets': 'localhost:8001/assets'
        }
      };
  grunt.registerTask('connect', 'Start a static web server.', function() {
    var port = 8001, base = path.resolve('.');
    grunt.log.writeln('Starting ssl web server in "' + base + '" on port ' + port + '.');
    var app = connect()
      .use(connect['static'](base))
      .use(connect.directory(base));
    https.createServer(options.https, app).listen(port);
  });
  grunt.registerTask('proxy', 'Start proxy server.', function() {
    proxy.createServer(options).listen(options.port);
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  grunt.registerTask('demo', ['connect', 'proxy', 'watch']);

};
