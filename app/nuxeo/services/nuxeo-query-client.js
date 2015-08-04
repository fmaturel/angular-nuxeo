angular.module('ngNuxeoClient')

  .service('nuxeoQueryClient', ['$resource', 'nuxeoUrl', 'nuxeoConstants', 'Document', 'nuxeoUser', '$log',
    function ($resource, url, cst, Document, nuxeoUser, $log) {

      return $resource(url.query, {}, {
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
          },
          transformResponse: function (data) {
            var result = angular.fromJson(data);
            return angular.extend(result, {
              entries: angular.isArray(result.entries) ? result.entries.map(function (entry) {
                var document = new Document(entry);
                document.isDeletable = entry.path.startsWith('/default-domain/UserWorkspaces/' + nuxeoUser.pathId);
                $log.debug(document.title + ' = ' + document.uid);
                return document;
              }) : []
            });
          }
        }
      });

    }]);