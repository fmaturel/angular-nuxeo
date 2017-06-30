angular.module('ngNuxeoSecurity')

  .service('nuxeoUser', ['$q', '$injector', '$http', '$resource', '$cookies', '$log', 'queryService', 'nuxeoUrl', 'nuxeoUtils',
    function($q, $injector, $http, $resource, $cookies, $log, queryService, url, utils) {

      var USER_COOKIE = 'NG_NUXEO_UID';

      var User = $resource(url.user, {userName: '@userName'});

      var defer = $q.defer();

      var nuxeoUser = new User({promise: defer.promise});

      /**
       * Log the user in
       * @param userName
       * @param password
       */
      nuxeoUser.login = function(userName, password) {
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

        User.get({userName: userName}, function(user) {
          if (user && user.id) {
            var pathId = '/default-domain/UserWorkspaces/' + utils.generateId(user.id, '-', false, 30);

            queryService.query({
              nxql: {
                query: 'SELECT * FROM Document WHERE ecm:path ="' + pathId + '"'
              },
              getHeaders: function () {
                return ['dublincore', 'file', 'webdisplay'];
              },
              isUserDependant: false
            }).then(function (data) {
              nuxeoUser.register({
                id: user.id,
                workspace: {
                  uid: data.data.entries[0].uid,
                  pathId: pathId
                }
              });
            });
          }
        }, function() {
          throw 'Error while retrieving current user';
        });
      };

      nuxeoUser.logout = function() {
        return $http.post(url.logout, null, {params: {noredirect: 'true'}});
      };

      nuxeoUser.register = function(user) {
        if(user && user.workspace) {
          var uid = $cookies.get(USER_COOKIE);

          if(uid && uid !== user.workspace.uid) {
            nuxeoUser.logout().finally(function() {
              defer.resolve(angular.extend(nuxeoUser, user));
            });
          } else {
            defer.resolve(angular.extend(nuxeoUser, user));
          }
          $cookies.put('NG_NUXEO_UID', user.workspace.uid);
        } else {
          $log.error('Will not attempt a nuxeo login as user is not well defined!');
        }
      };

      return nuxeoUser;
    }]);
