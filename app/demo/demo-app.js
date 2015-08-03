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
      baseURL: 'http://demo.nuxeo.local/nuxeo/site',
      apiPath: '/api/v1',
      automationPath: '/api/v1/automation',
      timeout: 5 // Timeout in seconds
    }
  })

  .config(['$httpProvider', '$routeProvider', function ($httpProvider, $routeProvider) {

    /*- SECURITY : REGISTER A REQUEST AUTH INTERCEPTOR ------------------------------------------------------ */
    $httpProvider.interceptors.push('BasicAuthInterceptor');

    /*- DEMO ROUTES ----------------------------------------------------------------------------------------- */
    $routeProvider
      .when('/demo', {
        templateUrl: 'demo.html',
        controller: 'DemoController'
      })
      .otherwise({redirectTo: '/demo'});
  }]);
