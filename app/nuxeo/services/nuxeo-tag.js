angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['nuxeoClient', '$log',
    function (nuxeoClient, $log) {

      var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.get = function (searchChars, successCallback) {
        return nuxeoClient.Query.get({query: tagQuery}, successCallback);
      };
    }]);