angular.module('ngNuxeoClient')

  .factory('User', ['$resource', 'nuxeoUrl',
    function ($resource, url) {

      var User = $resource(url.user, {userName: '@userName'}, {
        get: {
          transformResponse: function (data) {
            var result = angular.fromJson(data);
            result.pathId = result.id.replace(/[@\.]/g, '-');
            return result;
          }
        }
      });

      User.prototype.callbacks = [];
      User.prototype.onResolved = function (callback) {
        if(this.$resolved) {
          callback(this);
        }
        this.callbacks.push(callback);
      };
      User.prototype.resolve = function (user) {
        this.callbacks.forEach(function (callback) {
          if (angular.isFunction(callback)) {
            callback(user);
          }
        });
      };
      return User;
    }]);