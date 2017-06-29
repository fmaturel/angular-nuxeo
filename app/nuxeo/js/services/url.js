angular.module('ngNuxeoClient')

  .service('nuxeoUrl', ['nuxeoConstants',
    function (cst) {

      var apiBase = cst.nuxeo.baseURL + cst.nuxeo.apiPath, automationBase = cst.nuxeo.baseURL + cst.nuxeo.automationPath;

      this.automate = automationBase;

      this.request = apiBase + '/directory/:object';

      this.query = apiBase + '/query';

      this.user = apiBase + '/user/:userName';

      this.logout = cst.nuxeo.baseURL + '/logout';
    }]);