;(function( window, undefined ){ 
 'use strict';

angular.module('ngNuxeoTemplate', [
    'template/nuxeo/nuxeo-documents.html',
    'template/nuxeo/nuxeo-document.html',
    'template/nuxeo/nuxeo-audio.html',
    'template/nuxeo/nuxeo-picture.html',
    'template/nuxeo/nuxeo-video.html',
    'template/nuxeo/nuxeo-note.html',
    'template/nuxeo/nuxeo-file.html'
  ]
);

angular.module('ngNuxeoUI', [
  'ngNuxeoTemplate',
  'ngNuxeoClient'
])

  .config(['$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
    }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoAudio', [function () {
    return {
      restrict: 'E',
      require: '^nuxeoDocument',
      replace: true, // replaces the <nuxeo-audio> element
      templateUrl: 'template/nuxeo/nuxeo-audio.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-audio.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-audio.html',
    '<div ng-if="entry.type === \'Audio\'">' +
    '  <img alt="audio" ng-src="{{thumbnailURL}}">' +
    '  <audio controls preload="none">' +
    '    <source ng-src="{{srcURL}}">' +
    '  </audio>' +
    '</div>');
}]);
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
    '<a class="thumbnail" href="{{srcURL || \'javascript:void(0)\'}}">' +
    '  <div class="media">' +
    '    <nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture>' +
    '    <nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio>' +
    '    <nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video>' +
    '    <nuxeo-note ng-if="entry.type === \'Note\'"></nuxeo-note>' +
    '    <nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file>' +
    '  </div>' +
    '  <div class="caption">' +
    '    <span>{{entry.title | limitTo:25}}</span>' +
    '  </div>' +
    '</a>');
}]);



angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-documents> element
      templateUrl: 'template/nuxeo/nuxeo-documents.html',
      controller: ['$scope', function($scope) {

        $scope.documents = {pageIndex: 0};

      }]
    };
  }]);

angular.module('template/nuxeo/nuxeo-documents.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-documents.html',
    '<ul class="nuxeo-docs">' +
    '  <li ng-repeat="entry in documents.entries"><nuxeo-document></nuxeo-document></li>' +
    '</ul>');
}]);


angular.module('ngNuxeoUI')

  .directive('nuxeoFile', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-file> element
      templateUrl: 'template/nuxeo/nuxeo-file.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-file.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-file.html',
    '<div ng-if="entry.type === \'File\'">' +
    '  <img alt="file" ng-src="{{thumbnailURL}}">' +
    '</div>');
}]);
angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-note> element
      templateUrl: 'template/nuxeo/nuxeo-note.html',
      controller: ['$scope', function ($scope) {
        var ctx = $scope.entry.contextParameters;
        if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
          $scope.thumbnailURL = ctx.thumbnail.url;
        }

        var fileProps = $scope.entry.properties['file:content'];
        $scope.srcURL = fileProps && fileProps.data;
      }]
    };
  }]);

angular.module('template/nuxeo/nuxeo-note.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-note.html',
    '<div ng-if="entry.type === \'Note\'">' +
    '  <img alt="note" ng-src="/images/notes.png">' +
    '</div>');
}]);
angular.module('ngNuxeoUI')

  .directive('nuxeoPicture', [function () {
    return {
      restrict: 'E',
      require: '^nuxeoDocument',
      replace: true, // replaces the <nuxeo-picture> element
      templateUrl: 'template/nuxeo/nuxeo-picture.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-picture.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-picture.html', '<img alt="{{entry.title}}" ng-src="{{thumbnailURL}}">');
}]);
angular.module('ngNuxeoUI')

  .directive('nuxeoVideo', [function () {
    return {
      restrict: 'E',
      require: '^nuxeoDocument',
      replace: true, // replaces the <nuxeo-video> element
      templateUrl: 'template/nuxeo/nuxeo-video.html'
    };
  }]);

angular.module('template/nuxeo/nuxeo-video.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('template/nuxeo/nuxeo-video.html',
    '<video ng-if="entry.type === \'Video\'" controls preload="none" ng-attr-poster="{{thumbnailURL}}">' +
    '  <source ng-src="{{srcURL}}">' +
    '</video>');
}]);}( window ));