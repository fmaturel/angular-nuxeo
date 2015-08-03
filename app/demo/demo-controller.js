angular.module('ngNuxeoDemoApp')

  .controller('DemoController', ['$scope', 'nuxeo', '$log',
    function ($scope, nuxeo, $log) {

      // ######################################################################### SEARCH SCOPE OBJECT
      $scope.search = {
        masters: {},

        path: {},
        mediaTypes: {'Picture': true, 'Audio': false, 'Video': false, 'Note': false, 'File': false},
        continents: {},
        selectedContinent: null,
        countries: {},
        selectedCountry: null,
        natures: {},
        selectedNature: null,
        subjects: {},
        selectedSubject: null,
        tags: [],
        terms: ''
      };

      // ######################################################################### SCOPE FUNCTIONS
      $scope.fn = {
        isActive: function (type) {
          return $scope.search.mediaTypes[type] === true;
        },
        toggle: function (type) {
          angular.forEach($scope.search.mediaTypes, function (v, k) {
            if (k === type) {
              $scope.search.mediaTypes[type] = !$scope.search.mediaTypes[type];
            } else {
              $scope.search.mediaTypes[k] = false;
            }
          });
          $scope.search.mediaTypes = angular.copy($scope.search.mediaTypes);
        },
        reduceContinent: function () {
          if ($scope.search.selectedCountry) {
            $scope.search.continents = _.filter($scope.search.masters.continents, {properties: {'id': $scope.search.selectedCountry.properties.parent}})
            $scope.search.selectedContinent = $scope.search.continents[0];
          }
        },
        reduceCountry: function () {
          if ($scope.search.selectedContinent) {
            $scope.search.countries = _.filter($scope.search.masters.countries, {properties: {'parent': $scope.search.selectedContinent.properties.id}})
          }
        }
      };

      // ######################################################################### SEARCH WATCHER
      $scope.$watchGroup([
          'search.path', 'search.terms', 'search.mediaTypes', 'documents.pageIndex',
          'search.selectedContinent', 'search.selectedCountry', 'search.selectedNature', 'search.selectedSubject'
        ],
        function () {
          new nuxeo.Query()
            // Requested path
            .onPath($scope.search.path || '/')

            // Defaults override if needed
            //.includeDeleted()
            .includeExpired()

            // Basic search
            .withTerms($scope.search.terms.split(' '))
            .withMedia($scope.search.mediaTypes)

            // Directory search
            .withCoverage($scope.search.selectedCountry || $scope.search.selectedContinent)
            .withNature($scope.search.selectedNature)
            .withSubject($scope.search.selectedSubject)

            // Pagination
            .paginate(12, $scope.documents.pageIndex)

            // Ordering
            //.sortBy('dc:title')
            //.sortBy('dc:title', 'DESC')
            //.sortBy(['dc:title', 'dc:description'])
            .sortBy({'dc:title': 'ASC', 'dc:description': 'DESC'})

            // Finally get documents
            .get(function (data) {
              $log.debug(data);
              $scope.documents = angular.extend(data, {
                pages: _.range(data.pageCount)
              });
            });
        }, true);

      nuxeo.continents.get(function (data) {
        $log.debug(data);
        $scope.search.masters.continents = data.entries;
        $scope.search.continents = angular.copy(data.entries);
      });

      nuxeo.countries.get(function (data) {
        $log.debug(data);
        $scope.search.masters.countries = data.entries;
        $scope.search.countries = angular.copy(data.entries);
      });

      nuxeo.natures.get(function (data) {
        $log.debug(data);
        $scope.search.natures = data.entries;
      });

      nuxeo.subjects.get(function (data) {
        $log.debug(data);
        $scope.search.subjects = data.entries;
      });

      nuxeo.tags.get(function (data) {
        $log.debug(data);
        $scope.search.tags = data;
      });
    }]);
