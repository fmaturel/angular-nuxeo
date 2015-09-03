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
        return function (options) {

          this.withSubject = function (subject) {
            if (subject && subject.properties) {
              options.subjectId = subject.properties.id;
            }
            return this;
          };

          this.getPart = function () {
            var subjectId = options.subjectId;
            if (angular.isString(subjectId)) {
              return subjectId.length ? ' AND (dc:subjects STARTSWITH \'' + map(subjectId) + '\')' : '';
            }
            return '';
          };
        };
      }];

    }]);