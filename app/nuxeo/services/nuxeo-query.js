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

      this.$get = ['NuxeoQueryFactory', 'nuxeoQueryClient', 'nuxeoUser', '$log', function (NuxeoQueryFactory, nuxeoQueryClient, nuxeoUser, $log) {
        return new NuxeoQueryFactory(nuxeoQueryClient, queryParts, nuxeoUser, $log);
      }];

    }]);