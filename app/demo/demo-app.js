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
        userName: 'Administrator',
        password: 'Administrator'
      }
    }
  })

  .config(['$httpProvider', '$sceDelegateProvider', '$routeProvider', 'nuxeoConstants',
    function ($httpProvider, $sceDelegateProvider, $routeProvider, cst) {

      /*- SECURITY : REGISTER A REQUEST AUTH INTERCEPTOR ------------------------------------------------------ */
      $httpProvider.interceptors.push('basicAuthInterceptor');

      /*- TRUST URL FROM THOSE SOURCE ----------------------------------------------------------------------------- */
      $sceDelegateProvider.resourceUrlWhitelist(['self', cst.nuxeo.baseURL + '*']);

      /*- DEMO ROUTES ----------------------------------------------------------------------------------------- */
      $routeProvider
        .when('/demo', {
          templateUrl: 'demo.html',
          controller: 'DemoController'
        })
        .otherwise({redirectTo: '/demo'});

    }]);
