angular.module('ngNuxeoDemoApp')

  .controller('ApiDemoController', ['$scope', 'nuxeo', '$log',
    function ($scope, nuxeo, $log) {

      $scope.nuxeo = nuxeo;

      $scope.model = {
        path: '',
        selectedType: nuxeo.Folder,
        types: [nuxeo.Folder, nuxeo.Section, nuxeo.Workspace]
      };

      $scope.operations = {
        create: function () {
          var name = $scope.model.selectedType.name;
          $scope.model.selectedType.create(
            {
              name: 'New' + name,
              properties: 'dc:title=My' + name + '\ndc:description= A simple ' + name
            },
            $scope.model.selectedType.prototype.defaultPath + '/' + $scope.model.path
          ).then(function (dir) {
              $log.debug(dir);
            }, function (response) {
              $log.error('Error on creation operation : [' + response.config.url + ']');
            });
        }
      };
    }]);