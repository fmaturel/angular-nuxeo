angular.module('ngNuxeoClient')

  .service('Query', ['$resource', 'nuxeoUrl', 'nuxeoConstants', 'Document', 'nuxeoUserPromise', '$log',
    function ($resource, url, cst, Document, nuxeoUserPromise, $log) {

      var getAction = {
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

        /**
         * Transforms the response received from server
         * @param data
         * @returns {void|Object|*}
         */
        transformResponse: function (data) {
          var result = angular.fromJson(data);
          return angular.extend(result, {
            entries: angular.isArray(result.entries) ? result.entries.map(function (entry) {
              var document = new Document(entry);

              var ctx = entry.contextParameters;
              if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
                document.thumbnailURL = ctx.thumbnail.url;
              }

              var fileContent = entry.properties['file:content'];
              if (fileContent && fileContent.data) {
                document.srcURL = fileContent.data;
              }

              nuxeoUserPromise.then(function (user) {
                document.isDeletable = entry.path.startsWith('/default-domain/UserWorkspaces/' + user.pathId);
              });

              $log.debug(document.title + ' = ' + document.uid);
              return document;
            }) : []
          });
        }
      };

      var Query = $resource(url.query, {query: '@query'}, {get: getAction});

      return function (query, isUserDependent) {
        getAction.isUserDependent = isUserDependent;
        return new Query({query: query});
      };
    }]);