angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryNature', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryNature');

      this.$get = [function () {
        return function (options) {

          this.withNature = function (nature) {
            if (nature && nature.properties) {
              options.natureId = nature.properties.id;
            }
            return this;
          };

          this.getPart = function () {
            var natureId = options.natureId;
            if (angular.isString(natureId)) {
              return natureId.length ? ' AND (dc:nature = \'' + natureId + '\')' : '';
            }
            return '';
          };
        };
      }];

    }]);