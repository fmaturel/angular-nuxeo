/*global module,require*/
(function() {
  'use strict';

  module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var serveStatic = require('serve-static');

    // Configurable paths for the application
    var appConfig = {
      app: 'app',
      dist: 'dist',
      test: 'test'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

      // Project settings
      yeoman: appConfig,

      // Watches files for changes and runs tasks based on the changed files
      watch: {
        js: {
          files: ['<%= yeoman.app %>/**/*.js'],
          tasks: ['newer:concat', 'newer:jshint:all'],
          options: {
            livereload: '<%= connect.options.livereload %>'
          }
        },
        jsTest: {
          files: ['<%= yeoman.test %>/spec/{,*/}*.js'],
          tasks: ['newer:jshint:test', 'karma']
        },
        html: {
          files: [
            '<%= yeoman.app %>/**/views/*.html'
          ],
          tasks: ['newer:html2js']
        },
        gruntfile: {
          files: ['Gruntfile.js']
        },
        livereload: {
          options: {
            livereload: '<%= connect.options.livereload %>'
          },
          files: [
            '<%= yeoman.app %>/*.*'
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
          port: 9020,
          // Change this to '0.0.0.0' to access the server from outside.
          hostname: 'localhost',
          livereload: 35020
        },
        livereload: {
          options: {
            open: {
              target: 'http://localhost:9020/demo'
            },
            middleware: function(connect) {
              return [
                function(req, res, next) {
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('Access-Control-Allow-Methods', '*');
                  res.setHeader('Access-Control-Allow-Credentials', 'true');
                  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                  res.setHeader('Access-Control-Allow-Headers',
                    'Accept, Content-type, Authorization, ' +
                    'Nuxeo-Transaction-Timeout, X-NXproperties, X-NXVoidOperation, X-NXenrichers.document');

                  next();
                },
                connect().use('/vendor', serveStatic('./node_modules')),
                serveStatic(appConfig.app),
                serveStatic(appConfig.dist)
              ];
            }
          }
        },
        test: {
          options: {
            port: 9121,
            middleware: function() {
              return [
                serveStatic(appConfig.test),
                serveStatic(appConfig.app),
                serveStatic(appConfig.dist)
              ];
            }
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
            '<%= yeoman.app %>/**/*.js'
          ]
        },
        test: {
          options: {
            jshintrc: '.jshintrc'
          },
          src: ['<%= yeoman.test %>/**/{,*/}*.js', '!<%= yeoman.test %>/helper.js']
        }
      },

      // Empties folders to start fresh
      clean: {
        dist: {
          files: [{
            dot: true,
            src: [
              '<%= yeoman.dist %>/{,*/}*'
            ]
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
            cwd: 'node_modules',
            src: [
              'angular/angular*.js',
              'angular-route/angular-route.js'],
            dest: '<%= yeoman.dist %>/vendor'
          }]
        }
      },

      // Transforms html templates to js
      html2js: {
        options: {
          base: '<%= yeoman.app %>',
          module: 'ngNuxeoUITemplates',
          quoteChar: '\'',
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          }
        },
        templates: {
          src: ['<%= yeoman.app %>/nuxeo-ui/views/**/*.html'],
          dest: '<%= yeoman.app %>/nuxeo-ui/js/views/templates.js'
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

    grunt.registerTask('serve', 'Compile then start a connect web server', function() {
      grunt.task.run([
        'jshint:all',
        'build',
        'connect:livereload',
        'watch'
      ]);
    });

    grunt.registerTask('test', [
      'html2js',
      'concat',
      'jshint',
      'connect:test',
      'karma'
    ]);

    grunt.registerTask('build', [
      'clean',
      'html2js',
      'concat',
      'copy:dist'
    ]);

    grunt.registerTask('default', [
      'newer:jshint',
      'test',
      'build'
    ]);
  };
}());
