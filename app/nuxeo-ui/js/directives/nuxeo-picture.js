angular.module('ngNuxeoUI')

  .directive('nuxeoPicture', ['nuxeoConstants', function (cst) {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-picture.html',
      link: function (scope, element, attrs) {
        if (attrs.display === 'large') {
          scope.thumbnailURL = cst.nuxeo.baseURL + '/nxbigfile/default/' + scope.entry.uid + '/picture:views/2/content/Medium_Photos.jpg';
        }
      }
    };
  }]);