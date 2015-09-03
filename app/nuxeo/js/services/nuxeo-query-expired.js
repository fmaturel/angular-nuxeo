angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryExpiration', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryExpiration');

      this.$get = ['$filter', function ($filter) {
        return function (options) {

          this.defaultOptions = {excludeExpired: true};

          this.excludeExpired = function () {
            options.excludeExpired = true;
            return this;
          };

          this.includeExpired = function () {
            options.excludeExpired = false;
            return this;
          };

          this.getPart = function () {
            if (options.excludeExpired) {
              return ' AND (dc:expired IS NULL OR dc:expired >= DATE \'' + $filter('date')(new Date(), 'yyyy-MM-dd') + '\')';
            }
            return '';
          };
        };
      }];

    }]);