angular.module('ngNuxeoSecurity')

  .service('nuxeoUser', ['User', 'nuxeoConstants',
    function (User, cst) {
      var nuxeoUser = new User();

      nuxeoUser.promise = nuxeoUser.$get({userName: cst.nuxeo.user.userName}, function (user) {
        angular.extend(nuxeoUser, user);
        nuxeoUser.resolve(user);
      }, function () {
        throw 'Error while retrieving current user';
      });

      return nuxeoUser;
    }])

  .service('userAuthInterceptor', ['$q', '$injector', 'nuxeoConstants', 'nuxeoUrl', '$log',
    function ($q, $injector, cst, url, $log) {
      return {
        request: function (config) {
          $log.debug(config.method + ' - ' + config.url);

          // DO NOT PROCESS NON API REQUEST
          if (!config.url.startsWith(cst.nuxeo.baseURL)) {
            return config;
          }

          // DO NOT PROCESS USER REQUEST
          if (config.url.startsWith(url.user.replace(':userName', ''))) {
            return config;
          }

          var user = $injector.get('nuxeoUser');

          // DO NOT DEFER WHEN USER IS RESOLVED
          if (user.$resolved) {
            return config;
          }

          // REQUESTS ARE DEFERED UNTIL USER IS RESOLVED
          var deferred = $q.defer();
          user.promise.finally(function () {
            deferred.resolve(config);
          });
          return deferred.promise;
        }
      };
    }]);