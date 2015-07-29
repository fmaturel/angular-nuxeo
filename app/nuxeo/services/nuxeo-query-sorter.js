angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySorter', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQuerySorter');

      this.$get = [function () {
        return function (options) {

          this.order = 100;

          this.sortBy = function (properties, orders) {
            if (angular.isArray(properties)) {
              options.sortBy = properties;
              if (angular.isArray(orders) && orders.length) {
                options.sortOrder = [orders];
              } else {
                options.sortOrder = [];
                properties.forEach(function () {
                  options.sortOrder.push('ASC');
                });
              }
            } else if (angular.isObject(properties)) {
              options.sortBy = [];
              options.sortOrder = [];
              Object.keys(properties).forEach(function (key) {
                options.sortBy.push(key);
                options.sortOrder.push(properties[key]);
              });
            } else if (angular.isString(properties)) {
              options.sortBy = [properties];
              if (angular.isString(orders) && orders.length) {
                options.sortOrder = [orders];
              } else {
                options.sortOrder = ['ASC'];
              }
            } else {
              throw 'Should sort using an Array or String property';
            }
            return this;
          };

          this.getPart = function () {
            if (angular.isDefined(options.sortBy)) {
              return '&sortBy=' + options.sortBy.join(',') + '&sortOrder=' + options.sortOrder.join(',') + '';
            }
            return '';
          };
        };
      }];

    }]);