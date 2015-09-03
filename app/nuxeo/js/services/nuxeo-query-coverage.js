angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryCoverage', ['QueryProvider',
    function (Query) {

      Query.addQueryPartProvider('NuxeoQueryCoverage');

      this.$get = [function () {
        return function (options) {

          this.withCoverage = function (coverage) {
            if (coverage && coverage.properties) {
              if (coverage.directoryName === 'continent') {
                options.continentId = coverage.properties.id;
              } else if (coverage.directoryName === 'country') {
                options.country = coverage.properties;
              }
            }
            return this;
          };

          this.getPart = function () {
            var continentId = options.continentId;
            var country = options.country;
            if (angular.isString(continentId)) {
              return continentId.length ? ' AND (dc:coverage STARTSWITH \'' + continentId + '\')' : '';
            } else if (angular.isObject(country)) {
              return ' AND (dc:coverage = \'' + country.parent + '/' + country.id + '\')';
            }
            return '';
          };
        };
      }];

    }]);