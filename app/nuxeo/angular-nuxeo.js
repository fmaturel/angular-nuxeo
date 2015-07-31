angular.module('ngNuxeoSecurity', []);

angular.module('ngNuxeoClient', [
  'ngNuxeoQueryPart'
]);

angular.module('ngNuxeoQueryPart', [
  'ngNuxeoQuery'
]);

angular.module('ngNuxeoQuery', [
  'ng',
  'ngResource',
  'ngNuxeoSecurity'
])

  .constant('nuxeoConstants', {
    path: '/nuxeo',
    nuxeo: {
      baseURL: 'http://demo.nuxeo.local/nuxeo',
      apiPath: '/site/api/v1',
      automationPath: '/site/api/v1/automation',
      timeout: 5 // Timeout in seconds
    }
  })

  .config(['nuxeoConstants', '$httpProvider',
    function (cst, $httpProvider) {

      /*- SECURITY : REGISTER SECURED PATH ------------------------------------------------------------------------ */
      $httpProvider.interceptors.push('BasicAuthInterceptor');
    }]);

