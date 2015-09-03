angular.module('ngNuxeoQueryPart')

  .provider('Query', [function () {

    var baseQuery = 'SELECT * FROM Document WHERE 1=1';

    var queryParts = [];

    this.addQueryPartProvider = function (queryPart) {
      queryParts.push(queryPart);
    };

    this.$get = ['$injector', '$resource', 'nuxeoUrl', 'nuxeoConstants', '$log',
      function ($injector, $resource, url, cst, $log) {

        function Query(query) {
          var options = {};

          this.parts = [];

          angular.extend(this, query);

          // Enrich Query with query providers
          angular.forEach(queryParts, function (queryPart) {
            var Part = $injector.get(queryPart);
            var part = new Part(options);

            angular.extend(this, new Part(options));
            if (angular.isObject(part.defaultOptions)) {
              angular.extend(options, part.defaultOptions);
            }
            if (angular.isFunction(part.getPart)) {
              this.parts.push({order: part.order || 0, getPart: part.getPart});
            }
          }, this);

          // Sort services by defined order
          this.parts = _.sortBy(this.parts, 'order').map(function (o) {
            return o.getPart;
          });
        }

        // Inherit
        var Resource = $resource(url.query, {query: '@query'}, {
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
            isUserDependent: true
          }
        });

        Query.prototype = new Resource();
        Query.prototype.constructor = Query;

        /**
         * Fetch result of query on nuxeo
         * @param successCallback
         * @param errorCallback
         */
        Query.prototype.$get = function (successCallback, errorCallback) {

          var that = this,
            nuxeo = $injector.get('nuxeo'),
            nuxeoUser = $injector.get('nuxeoUser');

          nuxeoUser.promise.then(function (user) {

            $log.debug(user);

            // Build query
            var query = baseQuery;
            angular.forEach(that.parts, function (getPart) {
              query += getPart(user);
            });

            // Log query
            $log.debug('Resulting query: ' + query);

            // Fetch query in nuxeo and transform result into Document Type
            return Resource.prototype.$get({query: query}, function (data) {

              data.entries = data.entries.map(function (entry) {
                if (nuxeo.hasOwnProperty(entry.type)) {
                  return new nuxeo[entry.type](entry);
                } else {
                  return new nuxeo.Document(entry);
                }
              });
              return data;
            }, errorCallback).then(successCallback);
          });
        };

        return Query;
      }];
  }]);