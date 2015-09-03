angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryParent', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryParent');

      this.$get = [function () {
        return function (options) {

          /**
           * Documents must have parents that have one of the targeted parent id
           * @param parentIds
           * @returns {*}
           */
          this.withParentIn = function (parentIds) {
            options.parentIds = parentIds;
            return this;
          };

          this.getPart = function () {
            if (angular.isArray(options.parentIds)) {
              return options.parentIds.length ? ' AND ecm:parentId IN (\'' + options.parentIds.join('\',\'') + '\')' : '';
            } else if (angular.isString(options.parentIds) && options.parentIds.length) {
              return ' AND (ecm:parentId = \'' + options.parentIds + '\')';
            }
            return '';
          };
        };
      }];

    }]);