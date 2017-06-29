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
      templateUrl: 'nuxeo-ui/views/nuxeo-audio.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoDocument', ['nuxeo', function (nuxeo) {

    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-document.html',
      scope: {
        entry: '=',
        uid: '@',
        deletable: '@',
        publishTo: '@',
        onSuccess: '&',
        onError: '&'
      },
      link: function (scope, element, attr) {
        if (!attr.entry) {
          if (attr.uid) {
            nuxeo.Document.query()
              // Basic search
              .withParentIn(attr.uid)
              // Get data
              .$get(function (data) {
                scope.entry = data.entries.length && data.entries[0];
              });
          } else {
            throw 'There should be either an entry or id in nuxeo document directive';
          }
        }

        if (attr.deletable === 'true') {
          scope.entry.isDeletable = true;
        } else if (attr.deletable === 'false'){
          scope.entry.isDeletable = false;
        }

        var publishPath = attr.publishPath;
        if (publishPath) {
          if (angular.isString(publishPath)) {
            scope.publishPath = publishPath;
          }
        }
      }
    };
  }]);
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
angular.module('ngNuxeoUI')

  .directive('nuxeoDraggable', [function () {
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        angular.element(el).attr('draggable', 'true');

        var entry = scope.$eval(attrs.nuxeoDraggable);
        if (entry) {
          var uid = entry.uid;

          el.bind('dragstart', function (e) {
            e.dataTransfer.setData('text', uid);
            scope.$emit('nuxeoDragStart');
          });

          el.bind('dragend', function () {
            scope.$emit('nuxeoDragEnd');
          });
        }
      }
    };
  }])

  .directive('nuxeoDropTarget', ['$rootScope', function ($rootScope) {

    return {
      restrict: 'A',
      link: function (scope, el, attrs) {

        var counter = 0;
        var entry = scope.$eval(attrs.nuxeoDropTarget);

        if (!entry) {
          return;
        }

        var uid = entry.uid;

        el.bind('dragover', function (e) {
          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }
          if (e.stopPropagation) {
            e.stopPropagation(); // Necessary. Allows us to drop.
          }

          e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
          return false;
        });

        el.bind('dragenter', function (e) {
          e.preventDefault(); // needed for IE
          counter++;
          el.addClass('nuxeo-over');
        });

        el.bind('dragleave', function () {
          counter--;
          if (counter === 0) {
            el.removeClass('nuxeo-over');
          }
        });

        el.bind('drop', function (e) {
          if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
          }

          if (e.stopPropagation) {
            e.stopPropagation(); // Necessary. Allows us to drop.
          }
          var data = e.dataTransfer.getData('text');

          scope.$eval(attrs.nuxeoOnDrop)(data, uid);
        });

        $rootScope.$on('nuxeoDragStart', function () {
          el.addClass('nuxeo-target');
        });

        $rootScope.$on('nuxeoDragEnd', function () {
          angular.element(el).removeClass('nuxeo-target');
          angular.element(el).removeClass('nuxeo-over');
        });
      }
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoFile', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-file.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoFolder', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-folder.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoNote', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-note.html'
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoPicture', ['nuxeoConstants', function (cst) {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-picture.html',
      link: function (scope, element, attrs) {
        if (attrs.display === 'large') {
          scope.thumbnailUrl = cst.nuxeo.baseURL + '/nxbigfile/default/' + scope.entry.uid + '/picture:views/2/content/Medium_Photos.jpg';
        }
      }
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoSelect', ['nuxeo', function (nuxeo) {

    return {
      restrict: 'EA',
      replace: true, // replaces the <nuxeo-select> element
      templateUrl: 'nuxeo-ui/views/nuxeo-select.html',
      scope: {
        directory: '@'
      },
      controller: ['$scope', function ($scope) {
        nuxeo[$scope.directory].get(function (data) {
          $scope.options = [{properties: {id: '-- all --', noFilter: true}}];
          $scope.options = $scope.options.concat(data.entries);
        });
      }]
    };
  }]);
angular.module('ngNuxeoUI')

  .directive('nuxeoVideo', [function () {
    return {
      restrict: 'E',
      templateUrl: 'nuxeo-ui/views/nuxeo-video.html'
    };
  }]);
angular.module('ngNuxeoUITemplates', ['nuxeo-ui/views/nuxeo-audio.html', 'nuxeo-ui/views/nuxeo-document.html', 'nuxeo-ui/views/nuxeo-documents.html', 'nuxeo-ui/views/nuxeo-file.html', 'nuxeo-ui/views/nuxeo-folder.html', 'nuxeo-ui/views/nuxeo-note.html', 'nuxeo-ui/views/nuxeo-picture.html', 'nuxeo-ui/views/nuxeo-select.html', 'nuxeo-ui/views/nuxeo-video.html']);

angular.module('nuxeo-ui/views/nuxeo-audio.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-audio.html',
    '<img alt=audio ng-src={{::entry.thumbnailUrl}}><audio controls preload=none><source ng-src={{::entry.srcUrl}}></audio>');
}]);

angular.module('nuxeo-ui/views/nuxeo-document.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-document.html',
    '<div class=thumbnail><a href=javascript:void(0)><div class=media ng-class="entry.type | lowercase"><nuxeo-folder ng-if="entry.type === \'Folder\'"></nuxeo-folder><nuxeo-picture ng-if="entry.type === \'Picture\'"></nuxeo-picture><nuxeo-audio ng-if="entry.type === \'Audio\'"></nuxeo-audio><nuxeo-video ng-if="entry.type === \'Video\'"></nuxeo-video><nuxeo-note ng-if="entry.type === \'Note\'"></nuxeo-note><nuxeo-file ng-if="entry.type === \'File\'"></nuxeo-file></div><div class=caption><span>{{entry.title | limitTo:25}}</span></div></a><div class=action><a class=download title=Download ng-href={{entry.srcUrl}} ng-if=entry.srcUrl><span class="glyphicon glyphicon-download-alt"></span> </a><a class=publish title=Publish href=javascript:void(0) ng-if=entry.isPublishable ng-click="entry.publish({target: publishPath}, onSuccess, onError)"><span class="glyphicon glyphicon-cloud-upload"></span> </a><a class=delete title=Delete href=javascript:void(0) ng-if=entry.isDeletable ng-click="entry.delete(onSuccess, onError)"><span class="glyphicon glyphicon-trash"></span></a></div></div>');
}]);

angular.module('nuxeo-ui/views/nuxeo-documents.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-documents.html',
    '<ul class=nuxeo-docs><li ng-repeat="entry in documents.entries" nuxeo-draggable=entry nuxeo-drop-target=entry nuxeo-on-drop=docsCtrl.dropped><nuxeo-document entry=entry publish-path={{publishPath}} on-success=onSuccess() on-error=onError()></nuxeo-document></li></ul>');
}]);

angular.module('nuxeo-ui/views/nuxeo-file.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-file.html',
    '<img alt=file ng-src={{::entry.thumbnailUrl}}>');
}]);

angular.module('nuxeo-ui/views/nuxeo-folder.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-folder.html',
    '<svg xmlns=http://www.w3.org/2000/svg version=1.2 width=140 height=110 viewBox="0 0 140 110"><switch transform="matrix(.33333 0 0 .33846 0 0)"><g><linearGradient id=a gradientUnits=userSpaceOnUse x1=210.75 x2=210.75 y2=827.286><stop offset=0 stop-color=#ffd445></stop><stop offset=.153 stop-color=#ff8f00></stop></linearGradient><path d="M204.515 24.667V10c0-5.5-4.5-10-10-10H44.849c-5.5 0-10 4.5-10 10v14.667H19.022c-3.483 0-9.411 4.5-9.506 9.999l.671 280.329c-.095 5.498 4.328 10.006 9.828 10.01h382.092c5.5.006 9.943-4.479 9.875-9.977L410.48 34.666c-.068-5.5-4.623-9.999-10.123-9.999H204.515z" fill=url(#a)></path><linearGradient id=b gradientUnits=userSpaceOnUse x1=209.999 y1=320.691 x2=209.999 y2=36.765><stop offset=0 stop-color=#e6e6e6></stop><stop offset=.633 stop-color=#e8e8e8></stop><stop offset=.949 stop-color=#f0f0f0></stop><stop offset=1 stop-color=#f2f2f2></stop></linearGradient><path d="M390.244 320.691H29.753l-1-283.927h362.491z" fill=url(#b)></path><linearGradient id=c gradientUnits=userSpaceOnUse x1=209.999 y1=320.691 x2=209.999 y2=49.765><stop offset=0 stop-color=#ccc></stop><stop offset=.427 stop-color=#cecece></stop><stop offset=.64 stop-color=#d6d6d6></stop><stop offset=.806 stop-color=#e3e3e3></stop><stop offset=.947 stop-color=#f6f6f6></stop><stop offset=1 stop-color=#fff></stop></linearGradient><path d="M390.244 320.691H29.753l-7-270.927h374.491z" fill=url(#c)></path><linearGradient id=d gradientUnits=userSpaceOnUse x1=209.998 y1=63.999 x2=209.998 y2=325.004><stop offset=0 stop-color=#ffde4f></stop><stop offset=.595 stop-color=#ffca3b></stop><stop offset=.957 stop-color=#ffd041></stop><stop offset=1 stop-color=#ff8f00></stop></linearGradient><path d="M411.508 315.027c-.096 5.5-4.672 9.99-10.172 9.977H19.243c-5.5-.014-10.662-5.178-10.757-10.676L0 73.998A9.822 9.822 0 0 1 9.827 64H410.17c5.5 0 9.922 4.5 9.826 9.999l-8.488 241.028z" fill=url(#d)></path></g></switch></svg>');
}]);

angular.module('nuxeo-ui/views/nuxeo-note.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-note.html',
    '<svg xmlns=http://www.w3.org/2000/svg version=1.1 x=0 y=0 width=140 height=140 viewBox="0 0 140 140" xml:space=preserve><path d="M20 13.1V4.4c0-2.4 2.2-4.4 5-4.4 2.8 0 5 2 5 4.4v8.7c0 2.4-2.2 4.4-5 4.4-2.7 0-5-2-5-4.4zm120 3.8V131.8c0 4.5-4.5 8.2-10 8.2H10C4.5 140 0 136.3 0 131.8V17C0 12.4 4.5 8.8 10 8.8h5v4.4c0 4.8 4.5 8.7 10 8.7 5.5 0 10-3.9 10-8.7V8.7h70v4.4c0 4.8 4.5 8.7 10 8.7 5.5 0 10-3.9 10-8.7V8.7h5c5.5 0 10 3.7 10 8.2zM130 35H10v96.2l120 0V35zM115 17.5c2.8 0 5-2 5-4.4V4.4C120 2 117.8 0 115 0c-2.8 0-5 2-5 4.4v8.7c0 2.4 2.2 4.4 5 4.4zM25 61.3h90c2.8 0 5-2 5-4.4 0-2.4-2.2-4.4-5-4.4H25c-2.8 0-5 2-5 4.4 0 2.4 2.3 4.4 5 4.4zm0 26.3h90c2.8 0 5-2 5-4.4 0-2.4-2.2-4.4-5-4.4H25c-2.8 0-5 2-5 4.4 0 2.4 2.3 4.4 5 4.4zm0 26.2h90c2.8 0 5-2 5-4.4 0-2.4-2.2-4.4-5-4.4H25c-2.8 0-5 2-5 4.4 0 2.5 2.3 4.4 5 4.4z" style=fill-opacity:0.8;fill:#104564 /></svg>');
}]);

angular.module('nuxeo-ui/views/nuxeo-picture.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-picture.html',
    '<img alt={{::entry.title}} ng-src={{::entry.thumbnailUrl}}>');
}]);

angular.module('nuxeo-ui/views/nuxeo-select.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-select.html',
    '<select title={{directory}} ng-options="option as option.properties.id for option in options | orderBy:\'properties.id\'"></select>');
}]);

angular.module('nuxeo-ui/views/nuxeo-video.html', []).run(['$templateCache', function ($templateCache) {
  $templateCache.put('nuxeo-ui/views/nuxeo-video.html',
    '<video controls preload=none ng-attr-poster={{::entry.thumbnailUrl}}><source ng-src={{::entry.srcUrl}}></video>');
}]);
}( window ));