angular.module('ngNuxeoDemoApp')

  .controller('DemoController', ['$scope', 'nuxeo', 'nuxeoUser', '$log',
    function ($scope, nuxeo, nuxeoUser, $log) {

      // ######################################################################### USER SCOPE OBJECT
      $scope.user = nuxeoUser;

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
          var f = document.getElementById('file').files[0], r = new FileReader();
          r.onloadend = function () {
            var file = new nuxeo.Document({
              type: 'Picture',
              name: f.name,
              properties: {
                'dc:title': f.name
              }
            });
            file.upload(f, uiChange, function () {
              window.alert('An error occurred uploading document');
            });
          };
          r.readAsBinaryString(f);
        },
        delete: function (index) {
          var file = $scope.documents.entries[index];
          file.delete(uiChange, function () {
            window.alert('An error occurred deleting document');
          });
        }
      };

      // ######################################################################### SEARCH WATCHER
      var uiChange = function () {
        var query = new nuxeo.Query()

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
        query.get(function (data) {
          $log.debug(data);
          $scope.documents = angular.extend(data, {
            pages: _.range(data.pageCount)
          });
        });
      };

      $scope.$watchGroup([
        'search.path', 'search.terms', 'search.mediaTypes', 'documents.pageIndex',
        'search.advanced.myMediaOnly',
        'search.advanced.selectedContinent', 'search.advanced.selectedCountry',
        'search.advanced.selectedNature', 'search.advanced.selectedSubject'
      ], uiChange, true);

      nuxeo.tags.get(function (data) {
        $log.debug(data);
        $scope.search.tags = data;
      });
    }]);
