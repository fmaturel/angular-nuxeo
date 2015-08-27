angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['Query',
    function (Query) {

      var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.get = function (searchChars, successCallback) {
        return new Query(tagQuery).$get(successCallback);
      };
    }]);