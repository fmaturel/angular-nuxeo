angular.module('ngNuxeoClient')

  .service('nuxeoUrl', ['nuxeoConstants',
    function (cst) {

      var apiBase = cst.nuxeo.baseURL + cst.nuxeo.apiPath;

      var automationBase = cst.nuxeo.baseURL + cst.nuxeo.automationPath;

      this.nuxeo = {
        automate: automationBase,
        file: automationBase + '/Document.GetBlob',
        query: apiBase + '/query?query=:query',
        request: apiBase
      };
    }]);