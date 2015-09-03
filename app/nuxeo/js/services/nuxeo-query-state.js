angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryState', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryState');

      this.$get = [function () {
        return function (options) {

          this.defaultOptions = {excludeDeleted: true};

          this.excludeDeleted = function () {
            options.excludeDeleted = true;
            return this;
          };

          this.includeDeleted = function () {
            options.excludeDeleted = false;
            return this;
          };

          this.getPart = function () {
            if (options.excludeDeleted) {
              return ' AND ecm:currentLifeCycleState <> \'deleted\'';
            }
            return '';
          };
        };
      }];

    }]);