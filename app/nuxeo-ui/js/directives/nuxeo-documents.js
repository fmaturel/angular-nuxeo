angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', ['nuxeo', function (nuxeo) {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-documents> element
      templateUrl: 'nuxeo-ui/views/nuxeo-documents.html',
      scope: {
        documents: '=',
        publishPath: '=',
        onSuccess: '&',
        onError: '&'
      },
      controller: ['$scope', 'Section', function ($scope, Section) {
        $scope.publishPath = Section.prototype.defaultPath;

        this.dropped = function (dragUid, dropUid) {
          var index = nuxeo.index($scope.documents.entries);

          var draggedEntry = index[dragUid];
          var targetEntry = index[dropUid];

          console.log('The entry dragged', draggedEntry);
          console.log('The entry dropped', targetEntry);

          draggedEntry.fold(targetEntry, function onSuccess() {
            console.info('Files folded successfully !');
            $scope.onSuccess();
          }, function onError() {
            console.error('Error encountered during file folding');
            $scope.onError();
          });
        };
      }], controllerAs: 'docsCtrl'
    };
  }]);