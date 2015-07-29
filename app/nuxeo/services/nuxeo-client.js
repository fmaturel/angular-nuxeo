angular.module('ngNuxeoClient')

  .service('nuxeoClient', ['$resource', 'nuxeoUrl', 'nuxeoConstants',
    function ($resource, url, cst) {

      var File = $resource(url.nuxeo.file, {}, {
        get: {
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'false',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          },
          responseType: 'arraybuffer',
          transformResponse: function (data, headers) {
            return {
              blob: new Blob([data], {
                type: headers('content-type')
              })
            };
          }
        }
      });

      var Query = $resource(url.nuxeo.query, {}, {
        get: {
          method: 'GET',
          headers: {
            /**
             * @see https://doc.nuxeo.com/display/NXDOC/Special+HTTP+Headers
             * Possible values: dublincore, file, *
             */
            'X-NXproperties': 'dublincore, file',
            /**
             * @see https://doc.nuxeo.com/display/NXDOC/Content+Enricher
             * Possible values: thumbnail, acls, preview, breadcrumb
             */
            'X-NXenrichers.document': 'thumbnail',
            /**
             * This header can be used when you want to control the transaction duration in seconds
             */
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          }
        }
      });

      return {
        File: File,

        Query: Query,

        request: function (path) {
          return $resource(url.nuxeo.request + '/' + path);
        }
      };
    }]);