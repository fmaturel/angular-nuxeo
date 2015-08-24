angular.module('ngNuxeoDemoApp', [
  'ng',
  'ngRoute',
  'ngNuxeoUI'
])

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
