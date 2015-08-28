angular.module('ngNuxeoClient')

  .factory('Folder', ['Document', '$http', '$injector', 'nuxeoUrl', 'nuxeoConstants',
    function (Document, $http, $injector, url, cst) {

      function executeHttp(o, successCallback, errorCallback) {
        $http(angular.extend({
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'true',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          }
        }, o)).then(function (response) {
          if (angular.isFunction(successCallback)) {
            successCallback(response);
          }
        }, function (response) {
          if (angular.isFunction(errorCallback)) {
            errorCallback(response);
          }
        });
      }

      var Folder = function (folder) {

        this.type = 'Folder';

        Document.call(this);

        // La classe fille surcharge la classe parente
        Folder.prototype = Object.create(Document.prototype);
        Folder.prototype.constructor = Folder;

        this.create = function (inPath, successCallback, errorCallback) {
          executeHttp({
            url: url.automate + '/Document.Create',
            headers: {
             'X-NXVoidOperation': 'false'
            },
            data: {
             input: inPath,
             params: this,
             context: {}
            }
          }, successCallback, errorCallback);
        };

        delete this.upload;
      };

      Folder.create = function (name, inPath, successCallback, errorCallback) {
        return new Folder({name: name}).create(inPath, successCallback, errorCallback);
      };

      return Folder;
    }]);