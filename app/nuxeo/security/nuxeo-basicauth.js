angular.module('ngNuxeoSecurity')

  .service('basicAuthInterceptor', ['nuxeoConstants',
    function (cst) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Basic ' + window.btoa(cst.nuxeo.user.userName + ':' + cst.nuxeo.user.password);
          return config;
        }
      };
    }]);