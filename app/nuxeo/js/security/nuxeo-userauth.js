angular.module('ngNuxeoSecurity')

  .service('userAuthInterceptor', ['$q', '$injector', 'nuxeoConstants', 'nuxeoUrl', '$log',
    function ($q, $injector, cst, url, $log) {
      return {
        request: function (config) {

          // DO NOT DEFER NON API REQUEST
          if (config.url.indexOf(cst.nuxeo.baseURL) !== 0) {
            return config;
          }

          // DO NOT DEFER USER INDEPENDENT REQUEST
          if (!config.isUserDependant) {
            return config;
          }

          $log.debug('userAuthInterceptor: ' + config.method + ' - ' + config.url);

          var nuxeoUser = $injector.get('nuxeoUser');

          // REQUESTS ARE DEFERED UNTIL USER IS RESOLVED
          var deferred = $q.defer();
          nuxeoUser.promise.then(function () {
            deferred.resolve(config);
          });
          return deferred.promise;
        }
      };
    }]);