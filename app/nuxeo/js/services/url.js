angular.module('ngNuxeoClient')

  .service('nuxeoUrl', ['nuxeoConstants',
    function (cst) {

      var apiBase = cst.nuxeo.baseURL + cst.nuxeo.apiPath;

      this.automate = cst.nuxeo.baseURL + cst.nuxeo.automationPath;

      this.request = apiBase + '/directory/:object';

      this.query = apiBase + '/search/pp/nxql_search/execute';

      this.user = apiBase + '/user/:userName';

      this.path = apiBase + '/path';

      this.logout = cst.nuxeo.baseURL + '/logout';
    }]);
