angular.module('ngNuxeoSecurity')

  .factory('BasicAuthInterceptor', [
    function () {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y';
          return config;
        }
      };
    }]);