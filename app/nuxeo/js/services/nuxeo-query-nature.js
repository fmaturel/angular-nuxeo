angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryNature', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryNature');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have target nature
           * @param nature
           * @returns {QueryPart}
           */
          this.withNature = function (nature) {
            if (nature && nature.properties && !nature.properties.noFilter) {
              this.options.natureId = nature.properties.id;
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          var natureId = options.natureId;
          if (angular.isString(natureId)) {
            return natureId.length ? ' AND (dc:nature = \'' + natureId + '\')' : '';
          }
          return '';
        };

        return QueryPart;
      }];

    }]);