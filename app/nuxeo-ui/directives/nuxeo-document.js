angular.module('ngNuxeoUI')

  .directive('nuxeoDocument', ['$http', function () {

    return {
      restrict: 'E',
      require: '^nuxeoDocuments',
      replace: true, // replaces the <nuxeo-document> element
      templateUrl: 'template/nuxeo/nuxeo-document.html',
      controller: ['$scope', 'nuxeo', function ($scope, nuxeo) {
        var ctx = $scope.entry.contextParameters;
        if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
          $scope.thumbnailURL = ctx.thumbnail.url;
        }

        var fileProps = $scope.entry.properties['file:content'];
        $scope.srcURL = fileProps && fileProps.data;

        //$scope.file = new nuxeo.File($scope.entry.path);
        //$scope.file.download = function() {
        //  this.getBlob(function (data) {
        //    var reader = new window.FileReader();
        //    reader.readAsDataURL(data.blob);
        //    reader.onloadend = function () {
        //      $scope.base64Data = reader.result;
        //      console.log($scope.base64Img);
        //
        //      var url = window.URL.createObjectURL(data.blob);
        //      var a = document.createElement("a");
        //      document.body.appendChild(a);
        //      //a.style = "display: none";
        //      a.href = url;
        //      a.download = 'test';
        //      a.click();
        //      window.URL.revokeObjectURL(url);
        //    }
        //  });
        //}
      }]
    };
  }]);

angular.module('template/nuxeo/nuxeo-document.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-document.html',
    '<a class="thumbnail" href="{{srcURL}}">' +
    '  <div class="media">' +
    '    <nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture>' +
    '    <nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio>' +
    '    <nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video>' +
    '    <nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file>' +
    '  </div>' +
    '  <div class="caption">' +
    '    <span>{{entry.title | limitTo:25}}</span>' +
    '  </div>' +
    '</a>');
}]);


