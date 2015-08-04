angular.module('ngNuxeoClient')

  .factory('User', ['$resource', 'nuxeoUrl',
    function ($resource, url) {

      var User = $resource(url.user, {}, {
        get: {
          transformResponse: function(data) {
            var result = angular.fromJson(data);
            result.pathId = result.id.replace(/[@\.]/g, '-');
            return result;
          }
        }
      });

      User.prototype.callbacks = [];
      User.prototype.onResolved = function (callback) {
        return this.callbacks.push(callback);
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