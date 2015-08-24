angular.module('ngNuxeoClient')

  .factory('NuxeoQueryFactory', ['$injector', 'Query', 'nuxeoUserPromise', '$log',
    function ($injector, Query, nuxeoUserPromise, $log) {

      var baseQuery = 'SELECT * FROM Document WHERE 1=1';

      return function (queryPartFactoryName) {

        var NuxeoQuery = function () {

          var options = {}, parts = [], isUserDependent = false;

          // Enrich with query providers
          angular.forEach(queryPartFactoryName, function (factoryName) {
            var Part = $injector.get(factoryName);
            var part = new Part(options);

            angular.extend(this, new Part(options));
            if (angular.isObject(part.defaultOptions)) {
              angular.extend(options, part.defaultOptions);
            }
            if (angular.isFunction(part.getPart)) {
              parts.push({order: part.order || 0, getPart: part.getPart});
            }
          }, this);

          // Sort services by defined order
          parts = _.sortBy(parts, 'order').map(function (o) {
            return o.getPart;
          });

          //********************************** PUBLIC METHODS
          this.get = function (successCallback, errorCallback) {
            var doGet = function () {
              var query = baseQuery;
              angular.forEach(parts, function (getPart) {
                query += getPart();
              });
              $log.debug('Nuxeo query built by NuxeoQuery Service: ' + query);
              return new Query(query, true).$get(successCallback, errorCallback);
            };

            if(options.isUserDependent) {
              nuxeoUserPromise.then(doGet);
            } else {
              doGet();
            }
          };
        };

        return NuxeoQuery;
      };

    }]);