angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryTerm', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryTerm');

      function termsQuery(val) {
        return '(dc:title like \'%' + val + '%\')';
      }

      this.$get = [function () {
        return function (options) {

          this.withTerms = function (terms) {
            options.terms = terms;
            return this;
          };

          this.getPart = function () {
            if (angular.isArray(options.terms)) {
              var terms = options.terms.reduce(function (result, val) {
                if (val.length) {
                  result += (result.length ? ' OR ' : '' ) + termsQuery(val);
                }
                return result;
              }, '');
              return terms.length ? ' AND (' + terms + ')' : '';
            } else if (angular.isString(options.terms) && options.terms.length) {
              return ' AND ' + termsQuery(options.terms);
            }
            return '';
          };
        };
      }];

    }]);