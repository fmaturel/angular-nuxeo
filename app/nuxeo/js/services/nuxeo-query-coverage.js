angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryCoverage', ['QueryProvider',
    function (Query) {

      Query.addQueryPartProvider('NuxeoQueryCoverage');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have target coverage
           * @param coverage
           * @returns {QueryPart}
           */
          this.withCoverage = function (coverage) {
            if (coverage && coverage.properties && !coverage.properties.noFilter) {
              if (coverage.directoryName === 'continent') {
                this.options.continentId = coverage.properties.id;
              } else if (coverage.directoryName === 'country') {
                this.options.country = coverage.properties;
              }
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          var continentId = options.continentId;
          var country = options.country;
          if (angular.isString(continentId)) {
            return continentId.length ? '(dc:coverage STARTSWITH \'' + continentId + '\')' : '';
          } else if (angular.isObject(country)) {
            return '(dc:coverage = \'' + country.parent + '/' + country.id + '\')';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
