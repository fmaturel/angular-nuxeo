angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryTerm', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryTerm');

      this.$get = [function () {

        function termsQuery(val) {
          return '(dc:title like \'%' + val + '%\')';
        }

        var QueryPart = function () {
          /**
           * Documents must have target terms
           * @param terms
           * @returns {QueryPart}
           */
          this.withTerms = function (terms) {
            this.options.terms = terms;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
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

        return QueryPart;
      }];
    }]);