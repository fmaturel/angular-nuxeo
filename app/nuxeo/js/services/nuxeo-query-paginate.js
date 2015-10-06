angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPaginate', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryPaginate');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Document pagination
           * @param size, page size
           * @param index, page index
           * @returns {QueryPart}
           */
          this.paginate = function (size, index) {
            this.options.size = size;
            this.options.index = index;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isDefined(options.size) && angular.isDefined(options.index)) {
            return {pageSize: options.size, currentPageIndex: options.index};
          }
          return null;
        };

        return QueryPart;
      }];

    }]);