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

          /**
           * Documents must have ancestors that have one of the targeted ancestors id
           * @param ancestorIds
           * @returns {QueryPart}
           */
          this.withAncestorIn = function (ancestorIds) {
            this.options.ancestorIds = ancestorIds;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isArray(options.parentIds)) {
            return options.parentIds.length ? 'ecm:parentId IN (\'' + options.parentIds.join('\',\'') + '\')' : '';
          } else if (angular.isString(options.parentIds) && options.parentIds.length) {
            return '(ecm:parentId = \'' + options.parentIds + '\')';
          }
          if (angular.isArray(options.ancestorIds)) {
            return options.ancestorIds.length ? 'ecm:ancestorId IN (\'' + options.ancestorIds.join('\',\'') + '\')' : '';
          } else if (angular.isString(options.ancestorIds) && options.ancestorIds.length) {
            return '(ecm:ancestorId = \'' + options.ancestorIds + '\')';
          }
          return '';
        };

        return QueryPart;
      }];

    }]);
