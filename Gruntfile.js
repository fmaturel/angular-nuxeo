/*global module,require*/
(function () {
  // Generated on 2015-05-21 using generator-angular 0.11.1
  'use strict';

  // # Globbing
  // for performance reasons we're only matching one level down:
  // 'test/spec/{,*/}*.js'
  // use this if you want to recursively match all subfolders:
  // 'test/spec/**/*.js'
  module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var bower = require('./bower.json');

    // Configurable paths for the application
    var appConfig = {
      name: bower.name,
      app: bower.appPath || 'app',
      dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

      // Project settings
      yeoman: appConfig,

      // Watches files for changes and runs tasks based on the changed files
      watch: {
        bower: {
          files: ['bower.json'],
          tasks: ['wiredep']
        },
        js: {
          files: ['<%= yeoman.app %>/*/{,*/}*.js'],
          tasks: ['newer:concat', 'newer:jshint:all'],
          options: {
            livereload: '<%= connect.options.livereload %>'
          }
        },
        jsTest: {
          files: ['test/spec/{,*/}*.js'],
          tasks: ['newer:jshint:test', 'karma']
        },
        gruntfile: {
          files: ['Gruntfile.js']
        },
        livereload: {
          options: {
            livereload: '<%= connect.options.livereload %>'
          },
          files: [
            '<%= yeoman.app %>/**/*.html',
            '<%= yeoman.app %>/*/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
          ]
        }
      },

      concat: {
        nuxeo: {
          src: [
            '<%= yeoman.app %>/nuxeo/**/*.js'
          ],
          dest: '<%= yeoman.dist %>/js/ng-nuxeo.js',
          options: {
            banner: ';(function( window, undefined ){ \n \'use strict\';\n\n',
            footer: '}( window ));'
          }
        },
        nuxeoUI: {
          src: [
            '<%= yeoman.app %>/nuxeo-ui/**/*.js'
          ],
          dest: '<%= yeoman.dist %>/js/ng-nuxeo-ui.js',
          options: {
            banner: ';(function( window, undefined ){ \n \'use strict\';\n\n',
            footer: '}( window ));'
          }
        }
      },

      // The actual grunt server settings
      connect: {
        options: {
          port: 9031,
          // Change this to '0.0.0.0' to access the server from outside.
          hostname: 'localhost',
          livereload: 35031
        },
        livereload: {
          options: {
            open: {
              target: 'http://demo.nuxeo.local/demo'
            },
            middleware: function (connect) {
              return [
                connect.static(appConfig.app),
                connect.static(appConfig.dist)
              ];
            }
          }
        },
        test: {
          options: {
            port: 9131,
            middleware: function (connect) {
              return [
                connect.static('test'),
                connect.static(appConfig.app),
                connect.static(appConfig.dist)
              ];
            }
          }
        },
        dist: {
          options: {
            open: {
              target: 'http://demo.nuxeo.local/demo'
            },
            base: '<%= yeoman.dist %>'
          }
        }
      },

      // Make sure code styles are up to par and there are no obvious mistakes
      jshint: {
        options: {
          jshintrc: '.jshintrc',
          reporter: require('jshint-stylish')
        },
        all: {
          src: [
            'Gruntfile.js',
            '<%= yeoman.dist %>/js/*.js'
          ]
        },
        test: {
          options: {
            jshintrc: '.jshintrc'
          },
          src: ['test/**/{,*/}*.js']
        }
      },

      // Empties folders to start fresh
      clean: {
        dist: {
          files: [{
            dot: true,
            src: [
              '<%= yeoman.dist %>/{,*/}*',
              '!<%= yeoman.dist %>/.git{,*/}*'
            ]
          }]
        }
      },

      // ng-annotate tries to make the code safe for minification automatically
      // by using the Angular long form for dependency injection.
      ngAnnotate: {
        dist: {
          files: [{
            expand: true,
            cwd: '<%= yeoman.dist %>/js',
            src: '*.js',
            dest: '<%= yeoman.dist %>/js'
          }]
        }
      },

      // Copies remaining files to places other tasks can use
      copy: {
        dist: {
          files: [{
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              'demo/**'
            ]
          }, {
            expand: true,
            cwd: '<%= yeoman.app %>/bower_components',
            src: '**',
            dest: '<%= yeoman.dist %>/bower_components'
          }]
        }
      },

      // Test settings
      karma: {
        unit: {
          configFile: 'test/karma.conf.js',
          singleRun: true
        }
      }
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
      if (target === 'dist') {
        return grunt.task.run(['build', 'connect:dist:keepalive']);
      }

      grunt.task.run([
        'concat',
        'connect:livereload',
        'watch'
      ]);
    });

    grunt.registerTask('test', [
      'connect:test',
      'karma'
    ]);

    grunt.registerTask('build', [
      'clean:dist',
      'concat',
      'ngAnnotate',
      'copy:dist'
    ]);

    grunt.registerTask('default', [
      'newer:jshint',
      'test',
      'build'
    ]);
  };
}());