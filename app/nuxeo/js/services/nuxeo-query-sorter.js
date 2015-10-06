angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySorter', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQuerySorter');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Document sorting
           * @param properties, properties to be sorted
           * @param orders, order type [ASC | DESC] for each property
           * @returns {QueryPart}
           */
          this.sortBy = function (properties, orders) {
            if (angular.isArray(properties)) {
              this.options.sortBy = properties;
              if (angular.isArray(orders) && orders.length) {
                this.options.sortOrder = [orders];
              } else {
                this.options.sortOrder = [];
                properties.forEach(function () {
                  this.options.sortOrder.push('ASC');
                }, this);
              }
            } else if (angular.isObject(properties)) {
              this.options.sortBy = [];
              this.options.sortOrder = [];
              Object.keys(properties).forEach(function (key) {
                this.options.sortBy.push(key);
                this.options.sortOrder.push(properties[key]);
              }, this);
            } else if (angular.isString(properties)) {
              this.options.sortBy = [properties];
              if (angular.isString(orders) && orders.length) {
                this.options.sortOrder = [orders];
              } else {
                this.options.sortOrder = ['ASC'];
              }
            } else {
              throw 'Should sort using an Array or String property';
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isDefined(options.sortBy)) {
            return {sortBy: options.sortBy.join(','), sortOrder: options.sortOrder.join(',')};
          }
          return null;
        };

        return QueryPart;
      }];
    }]);