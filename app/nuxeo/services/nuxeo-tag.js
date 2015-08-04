angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['nuxeoQueryClient',
    function (nuxeoQueryClient) {

      var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.get = function (searchChars, successCallback) {
        return nuxeoQueryClient.get({query: tagQuery}, successCallback);
      };
    }]);