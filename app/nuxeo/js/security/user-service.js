angular.module('ngNuxeoSecurity')

  .service('nuxeoUser', ['$q', '$injector', 'User',
    function ($q, $injector, User) {

      var nuxeoUser = $q.defer();

      nuxeoUser.login = function (userName, password) {
        if(!userName && !(userName = this.userName)) {
          throw 'a userName must be defined';
        }

        var userResource = new User({userName: userName});

        if ($injector.has('basicAuthInterceptor')) {
          if(!password && !(password = this.password)) {
            throw 'a password must be defined';
          }

          var basicAuth = $injector.get('basicAuthInterceptor');
          basicAuth.setUser({userName: userName, password: password});
        }

        nuxeoUser.resolve(userResource.$get(function (user) {
          angular.extend(userResource, user);
        }, function () {
          throw 'Error while retrieving current user';
        }));
      };

      return nuxeoUser;
    }])

  .service('nuxeoUserPromise', ['nuxeoUser',
    function (nuxeoUser) {
      return nuxeoUser.promise;
    }]);