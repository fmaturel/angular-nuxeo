angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryParent', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryParent');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have parents that have one of the targeted parent id
           * @param parentIds
           * @returns {QueryPart}
           */
          this.withParentIn = function (parentIds) {
            this.options.parentIds = parentIds;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isArray(options.parentIds)) {
            return options.parentIds.length ? ' AND ecm:parentId IN (\'' + options.parentIds.join('\',\'') + '\')' : '';
          } else if (angular.isString(options.parentIds) && options.parentIds.length) {
            return ' AND (ecm:parentId = \'' + options.parentIds + '\')';
          }
          return '';
        };

        return QueryPart;
      }];

    }]);