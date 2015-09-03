angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['Query',
    function () {

      //var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.$get = function () {
        // TODO
        return null; //new Query(tagQuery).$get(successCallback, errorCallback);
      };
    }]);