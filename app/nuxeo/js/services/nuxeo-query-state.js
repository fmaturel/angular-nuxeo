angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryState', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryState');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must not be deleted
           * @returns {QueryPart}
           */
          this.excludeDeleted = function () {
            this.options.excludeDeleted = true;
            return this;
          };
          /**
           * Documents can be deleted
           * @returns {QueryPart}
           */
          this.includeDeleted = function () {
            this.options.excludeDeleted = false;
            return this;
          };
        };

        QueryPart.defaultOptions = {excludeDeleted: true};

        QueryPart.getPart = function (options) {
          if (options.excludeDeleted) {
            return ' AND ecm:currentLifeCycleState <> \'deleted\'';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);