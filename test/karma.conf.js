module.exports = function (config) {
  'use strict';

  config.set({

    basePath: '../',

    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-resource/angular-resource.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'test/helper.js',
      '*/nuxeo/**/*.js',
      '*/nuxeo-ui/**/*.js',
      '*/demo/js/*.js',
      '*/demo/js/**/*.js',

      // fixtures
      'test/fixture/**/*.json', // JSON fixtures
      'test/fixture/**/*.html'  // HTML fixtures
    ],

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'test/fixture/',
      // prepend this to the
      prependPrefix: 'expected/'
    },

    ngJson2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'test/fixture/',
      // prepend this to the
      prependPrefix: 'data/'
    },

    preprocessors: {
      'test/fixture/**/*.html': ['ng-html2js'],
      'test/fixture/**/*.json': ['ng-json2js']
    },

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: [
      //'Chrome',
      'PhantomJS'
    ],

    // web server port
    port: 9132,

    plugins: [
      //'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-ng-html2js-preprocessor',
      'karma-ng-json2js-preprocessor',
      'karma-jasmine'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG

    // Uncomment the following lines if you are using grunt's server to run the tests
    //proxies: {
    //  '/': 'http://localhost:9001/'
    //},
    //
    //// URL root prevent conflicts with the site root
    //urlRoot: '_karma_'
  });
};
