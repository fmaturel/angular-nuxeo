angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPath', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryPath');

      function pathQuery(val) {
        return '(ecm:path STARTSWITH \'' + val + '\')';
      }

      this.$get = [function () {
        return function (options) {

          this.onPath = function (path) {
            options.path = path;
            return this;
          };

          this.getPart = function () {
            if (angular.isArray(options.path)) {
              var terms = _(options.path).reduce(function (memo, val) {
                if (val.length) {
                  memo += (memo.length ? ' OR ' : '' ) + pathQuery(val);
                }
                return memo;
              }, '');
              return terms.length ? ' AND (' + terms + ')' : '';
            } else if (angular.isString(options.path) && options.path.length) {
              return ' AND ' + pathQuery(options.path);
            }
            return '';
          };
        };
      }];

    }]);