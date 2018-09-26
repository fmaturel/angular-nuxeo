angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryExpiration', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryExpiration');

      this.$get = ['$filter', function ($filter) {
        var QueryPart = function () {
          /**
           * Documents must not be expired
           * @returns {QueryPart}
           */
          this.excludeExpired = function () {
            this.options.excludeExpired = true;
            return this;
          };
          /**
           * Documents can be expired
           * @returns {QueryPart}
           */
          this.includeExpired = function () {
            this.options.excludeExpired = false;
            return this;
          };
        };

        // Don't provide default behaviour
        // QueryPart.defaultOptions = {excludeExpired: false};

        QueryPart.getPart = function (options) {
          if (options.excludeExpired) {
            return '(dc:expired IS NULL OR dc:expired >= DATE \'' + $filter('date')(new Date(), 'yyyy-MM-dd') + '\')';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
