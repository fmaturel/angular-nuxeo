angular.module('ngNuxeoQuery')

/**
 * @see https://doc.nuxeo.com/display/NXDOC/Query+Endpoint
 * @see https://doc.nuxeo.com/display/NXDOC/NXQL
 */
  .provider('NuxeoQuery', [
    function () {

      var queryParts = [];

      this.addQueryPartProvider = function (queryPart) {
        queryParts.push(queryPart);
      };

      this.$get = ['NuxeoQueryFactory', function (NuxeoQueryFactory) {
        return new NuxeoQueryFactory(queryParts);
      }];

    }]);