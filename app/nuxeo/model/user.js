angular.module('ngNuxeoClient')

  .factory('User', ['$resource', 'nuxeoUrl',
    function ($resource, url) {

      var User = $resource(url.user, {userName: '@userName'}, {
        get: {
          transformResponse: function (data, headersGetter, status) {
            var result = angular.fromJson(data);
            if (status === 200) {
              result.pathId = result.id.replace(/[@\.]/g, '-');
            }
            return result;
          }
        }
      });

      return User;
    }]);