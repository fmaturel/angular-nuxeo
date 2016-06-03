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

        el.bind('dragleave', function (e) {
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