angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPaginate', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryPaginate');

      this.$get = [function () {
        return function (options) {

          this.paginate = function (size, index) {
            options.size = size;
            options.index = index;
            return this;
          };

          this.getPart = function () {
            if (angular.isDefined(options.size) && angular.isDefined(options.index)) {
              return {pageSize: options.size, currentPageIndex: options.index};
            }
            return null;
          };
        };
      }];

    }]);