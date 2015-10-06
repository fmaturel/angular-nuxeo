angular.module('ngNuxeoQueryPart')

  .service('queryService', ['$http', 'nuxeoUrl', 'nuxeoConstants',
    function ($http, url, cst) {

      var getConfig = function (query) {
        return {
          params: query.nxql,
          headers: {
            /**
             * @see https://doc.nuxeo.com/display/NXDOC/Special+HTTP+Headers
             * Possible values: dublincore, file, picture, *,...
             */
            'X-NXproperties': function () {
              return query.getHeaders('nxProperties').join(',');
            },
            /**
             * @see https://doc.nuxeo.com/display/NXDOC/Content+Enricher
             * Possible values: thumbnail, acls, preview, breadcrumb
             */
            'X-NXenrichers.document': 'thumbnail',
            /**
             * This header can be used when you want to control the transaction duration in seconds
             */
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          },
          isUserDependent: true
        };
      };

      this.query = function (query, successCallback, errorCallback) {
        return $http.get(url.query, getConfig(query)).then(successCallback, errorCallback);
      };
    }]);