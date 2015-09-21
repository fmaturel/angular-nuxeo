;(function( window, undefined ){ 
 'use strict';

angular.module('ngNuxeoUI', [
  'ngNuxeoUITemplates',
  'ngNuxeoClient'
])

  .config(['$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript|blob):/);
    }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoAudio', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-audio> element
      templateUrl: 'nuxeo-ui/views/nuxeo-audio.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoDocument', ['$http', function () {

    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-document> element
      templateUrl: 'nuxeo-ui/views/nuxeo-document.html',
      scope: {
        entry: '=',
        deletable: '@',
        publishTo: '@',
        onSuccess: '&',
        onError: '&'
      },
      link: function (scope, element, attr) {
        if (attr.deletable === 'true') {
          scope.entry.isDeletable = true;
        }

        var publishPath = attr.publishTo;
        if (publishPath) {
          if (angular.isString(publishPath)) {
            scope.publishPath = publishPath;
          }
        }
      }
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoDocuments', [function () {
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
        $scope.documents = {pageIndex: 0};

        $scope.publishPath = Section.prototype.defaultPath;
      }]
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoFile', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-file> element
      templateUrl: 'nuxeo-ui/views/nuxeo-file.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-note> element
      templateUrl: 'nuxeo-ui/views/nuxeo-note.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoPicture', ['nuxeoConstants', function (cst) {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-picture> element
      templateUrl: 'nuxeo-ui/views/nuxeo-picture.html',
      link: function (scope, element, attrs) {
        if (attrs.display === 'large') {
          scope.thumbnailURL = cst.nuxeo.baseURL + '/nxbigfile/default/' + scope.entry.uid + '/picture:views/2/content/Medium_Photos.jpg';
        }
      }
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoSelect', ['nuxeo', function (nuxeo) {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-select> element
      templateUrl: 'nuxeo-ui/views/nuxeo-select.html',
      scope: {
        directory: '@',
        property: '@',
        model: '='
      },
      link: function postLink(scope) {
        nuxeo[scope.directory].get(function (data) {
          scope.items = data.entries;
        });
      }
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoVideo', [function () {
    return {
      restrict: 'E',
      replace: true, // replaces the <nuxeo-video> element
      templateUrl: 'nuxeo-ui/views/nuxeo-video.html'
    };
  }]);
angular.module('ngNuxeoUITemplates', ['nuxeo-ui/views/nuxeo-audio.html', 'nuxeo-ui/views/nuxeo-document.html', 'nuxeo-ui/views/nuxeo-documents.html', 'nuxeo-ui/views/nuxeo-file.html', 'nuxeo-ui/views/nuxeo-note.html', 'nuxeo-ui/views/nuxeo-picture.html', 'nuxeo-ui/views/nuxeo-select.html', 'nuxeo-ui/views/nuxeo-video.html']);

angular.module('nuxeo-ui/views/nuxeo-audio.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-audio.html',
    '<div ng-if="entry.type === \'Audio\'">\n' +
    '  <img alt="audio" ng-src="{{entry.thumbnailURL}}">\n' +
    '  <audio controls preload="none">\n' +
    '    <source ng-src="{{entry.srcURL}}">\n' +
    '  </audio>\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-document.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-document.html',
    '<div class="thumbnail">\n' +
    '  <a href="javascript:void(0)">\n' +
    '    <div class="media" ng-class="entry.type | lowercase">\n' +
    '      <nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture>\n' +
    '      <nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio>\n' +
    '      <nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video>\n' +
    '      <nuxeo-note ng-if="entry.type === \'Note\'"></nuxeo-note>\n' +
    '      <nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file>\n' +
    '    </div>\n' +
    '    <div class="caption">\n' +
    '      <span>{{entry.title | limitTo:25}}</span>\n' +
    '    </div>\n' +
    '  </a>\n' +
    '\n' +
    '  <div class="action">\n' +
    '    <a class="download" title="Download" href="{{entry.srcURL || \'javascript:void(0)\'}}">\n' +
    '      <span class="glyphicon glyphicon-download-alt"></span>\n' +
    '    </a>\n' +
    '    <a class="publish" title="Publish" href="javascript:void(0)" ng-if="entry.isPublishable" ng-click="entry.publish({target: publishPath}, onSuccess, onError)">\n' +
    '      <span class="glyphicon glyphicon-cloud-upload"></span>\n' +
    '    </a>\n' +
    '    <a class="delete" title="Delete" href="javascript:void(0)" ng-if="entry.isDeletable" ng-click="entry.delete(onSuccess, onError)">\n' +
    '      <span class="glyphicon glyphicon-trash"></span>\n' +
    '    </a>\n' +
    '  </div>\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-documents.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-documents.html',
    '<ul class="nuxeo-docs">\n' +
    '  <li ng-repeat="entry in documents.entries">\n' +
    '    <nuxeo-document entry="entry" publish-to="{{publishPath}}" on-success="onSuccess()" on-error="onError()"></nuxeo-document>\n' +
    '  </li>\n' +
    '</ul>');
}]);

angular.module('nuxeo-ui/views/nuxeo-file.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-file.html',
    '<div ng-if="entry.type === \'File\'">\n' +
    '  <img alt="file" ng-src="{{entry.thumbnailURL}}">\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-note.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-note.html',
    '<div ng-if="entry.type === \'Note\'">\n' +
    '  <img alt="note"\n' +
    '       src="data:image/png;base64,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">\n' +
    '</div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-picture.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-picture.html',
    '<img alt="{{entry.title}}" ng-src="{{thumbnailURL || entry.thumbnailURL}}">');
}]);

angular.module('nuxeo-ui/views/nuxeo-select.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-select.html',
    '<select ng-options="item.properties.{{property || \'label\'}} for item in items" ng-model="model">\n' +
    '  <!-- items -->\n' +
    '</select>');
}]);

angular.module('nuxeo-ui/views/nuxeo-video.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-video.html',
    '<video ng-if="entry.type === \'Video\'" controls preload="none" ng-attr-poster="{{entry.thumbnailURL}}">\n' +
    '  <source ng-src="{{entry.srcURL}}">\n' +
    '</video>');
}]);
}( window ));