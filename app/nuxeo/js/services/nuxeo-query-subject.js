angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySubject', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQuerySubject');

      function map(subjectId) {
        return {
          'arts': 'Art',
          'business': 'Art',
          'computers': 'Art',
          'games': 'Art',
          'health': 'Art',
          'home': 'Art',
          'kids-and-teens': 'Art',
          'news': 'Art',
          'recreation': 'Art',
          'reference': 'Art',
          'regional': 'Art',
          'science': 'Art',
          'shopping': 'Art',
          'society': 'Art',
          'sports': 'Art'
        }[subjectId];
      }

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have target subject
           * @param subject
           * @returns {QueryPart}
           */
          this.withSubject = function (subject) {
            if (subject && subject.properties && !subject.properties.noFilter) {
              this.options.subjectId = subject.properties.id;
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          var subjectId = options.subjectId;
          if (angular.isString(subjectId)) {
            return subjectId.length ? ' AND (dc:subjects STARTSWITH \'' + map(subjectId) + '\')' : '';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);