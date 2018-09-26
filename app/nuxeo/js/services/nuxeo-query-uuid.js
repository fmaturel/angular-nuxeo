angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryUUID', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryUUID');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have targeted uuids
           * @param uuids
           * @returns {QueryPart}
           */
          this.withUUIDs = function (uuids) {
            this.options.uuids = uuids;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isArray(options.uuids)) {
            return options.uuids.length ? 'ecm:uuid IN (\'' + options.uuids.join('\',\'') + '\')' : '';
          } else if (angular.isString(options.uuids) && options.uuids.length) {
            return '(ecm:uuid = \'' + options.uuids + '\')';
          }
          return '';
        };

        return QueryPart;
      }];

    }]);
