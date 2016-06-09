angular.module('ngNuxeoClient')

  .factory('Automation', ['$injector', '$http', '$q', 'nuxeoConstants',
    function ($injector, $http, $q, cst) {

      function Automation() {
      }

      // Inherit
      Automation.prototype = {};
      Automation.prototype.constructor = Automation;

      Automation.prototype.automate = function (requestSpec, successCallback, errorCallback) {
        var that = this;
        return $http(angular.extend({
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'true',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          }
        }, requestSpec)).then(function (response) {
          // Extends root object with properties coming from nuxeo
          angular.extend(that, response.data);

          // Run the successCallback if available
          if (successCallback && angular.isFunction(successCallback)) {
            return successCallback(that);
          }
          // Don't forget to pass the object to other "then" methods
          return that;
        }, function (response) {
          // Run the errorCallback if available
          if (errorCallback && angular.isFunction(errorCallback)) {
            return errorCallback(response);
          }
          // Don't forget to pass the response to other "error" methods
          return $q.reject(response);
        });
      };

      return Automation;
    }]);