angular.module('ngNuxeoQueryPart')

  .provider('Query', [function () {

    var baseQuery = 'SELECT * FROM Document WHERE 1=1';

    var queryParts = [];

    this.addQueryPartProvider = function (queryPart) {
      queryParts.push(queryPart);
    };

    this.$get = ['$injector', 'queryService', '$log',
      function ($injector, queryService, $log) {

        /**
         * Compose Query object
         */
        var parts = [], defaultOptions = {};

        // Enrich Query with query providers
        queryParts.forEach(function (queryPart) {
          var Part = $injector.get(queryPart);

          angular.extend(Query.prototype, new Part());
          if (angular.isObject(Part.defaultOptions)) {
            angular.extend(defaultOptions, Part.defaultOptions);
          }
          if (angular.isFunction(Part.getPart)) {
            parts.push(Part.getPart);
          }
        }, this);

        /**
         * Query constructor
         * @param query
         * @constructor
         */
        function Query(query) {
          this.options = angular.copy(defaultOptions);
          angular.extend(this, query);
        }

        /**
         * Get nuxeo query headers
         * @param headerName
         * @returns {Array}
         */
        Query.prototype.getHeaders = function (headerName) {

          var result = [];

          function getHeader(headers) {
            var result = [];
            if (headers && headers[headerName]) {
              var header = headers[headerName];
              if (angular.isArray(header)) {
                result = result.concat(header);
              } else if (angular.isString(header)) {
                result.push(header);
              }
            }
            return result;
          }

          if (this.headers) {
            result = getHeader(this.headers);
          } else {
            var Constr = this.DocumentConstructor;
            while (Constr) {
              result = result.concat(getHeader(Constr.headers));
              Constr = Constr.super;
            }
          }

          return result;
        };

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
            that.nxql = {query: baseQuery};
            parts.forEach(function (getPart) {
              var result = getPart(that.options, user);
              if (result) {
                if (angular.isString(result)) {
                  that.nxql.query += result;
                } else if (angular.isObject(result)) {
                  angular.extend(that.nxql, result);
                }
              }
            });

            // Log query
            $log.debug('Resulting query: ' + that.nxql.query);

            // Fetch query in nuxeo and transform result into Document Type
            return queryService.query(that, function (response) {
              var data = response.data;
              data.entries = data.entries ? data.entries.map(function (entry) {
                if (nuxeo.hasOwnProperty(entry.type)) {
                  return new nuxeo[entry.type](entry);
                } else {
                  return new nuxeo.Document(entry);
                }
              }): [];

              // Add custom properties
              /* jshint -W064 */
              angular.extend(data, {
                pages: Array.apply(null, Array(data.pageCount)).map(function (x, i) {
                  return i;
                }),
                pageNumber: data.pageIndex + 1
              });
              /* jshint +W034 */

              return data;
            }, errorCallback).then(successCallback);
          });
        };

        return Query;
      }];
  }]);