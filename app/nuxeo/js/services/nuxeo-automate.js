angular.module('ngNuxeoClient')

  .service('nuxeoAutomate', ['$http', '$q', 'nuxeoConstants',
    function ($http, $q, cst) {

      return function (object, requestSpec, successCallback, errorCallback) {
        return $http(angular.extend({
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'true',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          }
        }, requestSpec)).then(function (response) {
          // Extends root object with properties coming from nuxeo
          angular.extend(object, response.data);

          // Run the successCallback if available
          if (successCallback && angular.isFunction(successCallback)) {
            return successCallback(response);
          }
          // Don't forget to pass the object to other "then" methods
          return object;
        }, function (response) {
          // Run the errorCallback if available
          if (errorCallback && angular.isFunction(errorCallback)) {
            return errorCallback(response);
          }
          // Don't forget to pass the response to other "error" methods
          return $q.reject(response);
        });
      };
    }]);