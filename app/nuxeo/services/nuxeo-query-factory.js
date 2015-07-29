angular.module('ngNuxeoClient')

  .factory('NuxeoQueryFactory', ['$injector',
    function ($injector) {

      var baseQuery = 'SELECT * FROM Document WHERE 1=1';

      return function (client, queryPartFactoryName, $log) {

        var QueryBuilder = function () {

          var options = {}, partBuilders = [];

          // Enrich with query providers
          angular.forEach(queryPartFactoryName, function (factoryName) {
            var Part = $injector.get(factoryName);
            var part = new Part(options);

            angular.extend(this, new Part(options));
            if (angular.isObject(part.defaultOptions)) {
              angular.extend(options, part.defaultOptions);
            }
            if (angular.isFunction(part.getPart)) {
              partBuilders.push({order: part.order || 0, getPart: part.getPart});
            }
          }, this);

          // Sort services by defined order
          partBuilders = _.sortBy(partBuilders, 'order').map(function (o) {
            return o.getPart;
          });

          //********************************** PUBLIC METHODS
          this.get = function (successCallback, errorCallback) {
            var query = baseQuery;// + getPath() + getNotDeleted() + getNotExpired() + getTerms() + getMedia() + getPagination();

            angular.forEach(partBuilders, function (builder) {
              query += builder(options);
            });

            $log.debug('Nuxeo query built by NuxeoQuery Service: ' + query);
            return client.Query.get({query: query}, successCallback, errorCallback);
          };
        };

        return QueryBuilder;
      };

    }]);