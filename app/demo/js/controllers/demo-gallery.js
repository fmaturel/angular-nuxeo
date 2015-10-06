angular.module('ngNuxeoDemoApp')

  .controller('GalleryDemoController', ['$scope', 'nuxeo', '$log',
    function ($scope, nuxeo, $log) {

      // ######################################################################### SEARCH SCOPE OBJECT
      $scope.search = {
        masters: {},

        mediaTypes: {'Picture': true, 'Audio': false, 'Video': false, 'Note': false, 'File': false},
        tags: [],
        terms: '',

        advanced: {
          myMediaOnly: false,
          continents: {},
          selectedContinent: null,
          countries: {},
          selectedCountry: null,
          natures: {},
          selectedNature: null,
          subjects: {},
          selectedSubject: null
        },

        upload: {}
      };

      $scope.documents = {
        pageIndex: 0
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
        upload: function () {
          var file = document.getElementById('file').files[0], reader = new FileReader();
          reader.onloadend = function () {
            var document = new nuxeo.Document({
              type: 'Picture',
              name: file.name,
              properties: {'dc:title': file.name}
            });
            document.upload(file, $scope.uiChange, function () {
              window.alert('An error occurred uploading document');
            });
          };
          reader.readAsBinaryString(file);
        }
      };

      // ######################################################################### SEARCH WATCHER
      $scope.uiChange = function () {
        var query = nuxeo.Document.query()

          // Defaults override if needed
          //.includeDeleted()
          .includeExpired()

          // Basic search
          .withTerms($scope.search.terms.split(' '))
          .withMedia($scope.search.mediaTypes)

          // Directory search
          .withCoverage($scope.search.advanced.selectedCountry || $scope.search.advanced.selectedContinent)
          .withNature($scope.search.advanced.selectedNature)
          .withSubject($scope.search.advanced.selectedSubject)

          // Pagination
          .paginate(12, $scope.documents.pageIndex)

          // Ordering
          //.sortBy('dc:title')
          //.sortBy('dc:title', 'DESC')
          //.sortBy(['dc:title', 'dc:description'])
          .sortBy({'dc:title': 'ASC', 'dc:description': 'DESC'});

        // If my media is selected
        if (!$scope.search.advanced.myMediaOnly) {
          query.inPath('/');
        } else {
          query.inUserWorkspace();
        }

        // Finally get documents
        query.$get(function (data) {
          $log.debug(data);
          $scope.documents = angular.extend(data);
        });
      };

      $scope.logError = function (response) {
        $log.error('An error occurred on document operation [' + (response.config && response.config.url) + ']');
      };

      $scope.$watchGroup([
        'search.path', 'search.terms', 'search.mediaTypes', 'documents.pageIndex',
        'search.advanced.myMediaOnly',
        'search.advanced.selectedContinent', 'search.advanced.selectedCountry',
        'search.advanced.selectedNature', 'search.advanced.selectedSubject'
      ], function (newValue, oldValue) {
        $log.debug(newValue, oldValue);
        $scope.uiChange();
      }, true);

      nuxeo.tags.$get(function (data) {
        $log.debug(data);
        $scope.search.tags = data;
      });
    }]);