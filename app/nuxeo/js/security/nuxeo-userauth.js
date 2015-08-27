angular.module('ngNuxeoSecurity')

  .service('userAuthInterceptor', ['$q', '$injector', 'nuxeoConstants', 'nuxeoUrl', '$log',
    function ($q, $injector, cst, url, $log) {
      return {
        request: function (config) {

          // DO NOT PROCESS NON API REQUEST
          if (!config.url.startsWith(cst.nuxeo.baseURL)) {
            return config;
          }

          // DO NOT PROCESS USER INDEPENDENT REQUEST
          if (!config.isUserDependent) {
            return config;
          }

          $log.debug('userAuthInterceptor: ' + config.method + ' - ' + config.url);

          var nuxeoUserPromise = $injector.get('nuxeoUserPromise');

          // REQUESTS ARE DEFERED UNTIL USER IS RESOLVED
          var deferred = $q.defer();
          nuxeoUserPromise.then(function () {
            deferred.resolve(config);
          });
          return deferred.promise;
        }
      };
    }]);