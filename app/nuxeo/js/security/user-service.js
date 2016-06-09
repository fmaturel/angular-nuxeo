angular.module('ngNuxeoSecurity')

  .service('nuxeoUser', ['$q', '$injector', '$resource', 'nuxeoUrl', 'nuxeoUtils',
    function ($q, $injector, $resource, url, utils) {

      var User = $resource(url.user, {userName: '@userName'});

      var defer = $q.defer();

      var nuxeoUser = new User({promise: defer.promise});

      /**
       * Log the user in
       * @param userName
       * @param password
       */
      nuxeoUser.login = function (userName, password) {
        if (!userName && !(userName = this.userName)) {
          throw 'a userName must be defined';
        }

        if ($injector.has('basicAuthInterceptor')) {
          if (!password && !(password = this.password)) {
            throw 'a password must be defined';
          }

          var basicAuth = $injector.get('basicAuthInterceptor');
          basicAuth.setUser({userName: userName, password: password});
        }

        User.get({userName: userName}, function (user) {
          if (user && user.id) {
            var pathId = utils.generateId(user.id, '-', false, 30);
            user = {
              id: user.id,
              workspace: {
                uid: '12345678910',
                pathId: '/default-domain/UserWorkspaces/' + pathId
              }
            };
          }
          nuxeoUser.register(user);
        }, function () {
          throw 'Error while retrieving current user';
        });
      };

      nuxeoUser.register = function (user) {
        defer.resolve(angular.extend(nuxeoUser, user));
      };

      return nuxeoUser;
    }]);