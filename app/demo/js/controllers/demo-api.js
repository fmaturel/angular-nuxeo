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
          var NuxeoDocument = $scope.model.selectedType;
          NuxeoDocument.create({
              name: $scope.model.path,
              properties: 'dc:title=' + $scope.model.path + '\ndc:description= A simple ' + NuxeoDocument.name
            },
            $scope.model.selectedType.prototype.defaultPath
          ).then(function (dir) {
            $log.debug(dir);
          }, function (response) {
            $log.error('Error on creation operation : [' + response.config.url + ']');
          });
        }
      };
    }]);