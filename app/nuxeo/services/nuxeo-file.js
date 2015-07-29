angular.module('ngNuxeoClient')

  .factory('NuxeoFile', ['nuxeoClient', '$log',
    function (nuxeoClient, $log) {

      var File = function (path) {

        this.file = new nuxeoClient.File({input: path});

        this.getBlob = function (successCallback, errorCallback) {
          return this.file.$get(successCallback, errorCallback);
        };
      };

      return File;
    }]);