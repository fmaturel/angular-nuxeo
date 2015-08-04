angular.module('ngNuxeoDemoApp', [
  'ng',
  'ngRoute',
  'ngNuxeoUI'
])

/**
 * Override constants to connect to nuxeo
 */
  .constant('nuxeoConstants', {
    nuxeo: {
      baseURL: 'http://demo.nuxeo.local/nuxeo',
      apiPath: '/site/api/v1',
      automationPath: '/site/api/v1/automation',
      timeout: 5, // Timeout in seconds
      user: {
        userName: 'xpallot@etiskapp.com',
        password: 'test'
      }
    }
  })

  .config(['$httpProvider', '$routeProvider', function ($httpProvider, $routeProvider) {

    /*- SECURITY : REGISTER A REQUEST AUTH INTERCEPTOR ------------------------------------------------------ */
    $httpProvider.interceptors.push('basicAuthInterceptor');

    /*- DEMO ROUTES ----------------------------------------------------------------------------------------- */
    $routeProvider
      .when('/demo', {
        templateUrl: 'demo.html',
        controller: 'DemoController'
      })
      .otherwise({redirectTo: '/demo'});
  }]);
