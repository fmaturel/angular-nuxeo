angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPaginate', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryPaginate');

      this.$get = [function () {
        return function (options) {

          this.order = 99;

          this.paginate = function (size, index) {
            options.size = size;
            options.index = index;
            return this;
          };

          this.getPart = function () {
            if (angular.isDefined(options.size) && angular.isDefined(options.index)) {
              return '&pageSize=' + options.size + '&currentPageIndex=' + options.index;
            }
            return '';
          };
        };
      }];

    }]);