angular.module('ngNuxeoClient')

  .factory('Document', ['$http', '$injector', 'nuxeoUrl', 'nuxeoConstants',
    function ($http, $injector, url, cst) {

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

      var Document = function (fileEntry) {

        angular.extend(this, fileEntry);

        this.$get = function (successCallback, errorCallback) {
          executeHttp({
            url: url.file.download,
            headers: {
              'X-NXVoidOperation': 'false'
            },
            responseType: 'arraybuffer',
            transformResponse: function (data, headers) {
              return {
                blob: new Blob([data], {
                  type: headers('content-type')
                })
              };
            }
          }, successCallback, errorCallback);
        };

        this.upload = function (file, successCallback, errorCallback) {

          var nuxeoUser = $injector.get('nuxeoUser');

          // First create a document
          executeHttp({
            url: url.automate + '/Document.Create',
            headers: {
              'X-NXVoidOperation': 'false'
            },
            data: {
              input: 'doc:/default-domain/UserWorkspaces/' + nuxeoUser.pathId,
              params: this,
              context: {}
            }
          }, function (response) {
            if (!response || !response.data || !response.data.uid) {
              errorCallback();
            }

            executeHttp({
              url: url.automate + '/Blob.AttachOnDocument',
              headers: {
                'Content-Type': 'multipart/form-data',
                'X-NXVoidOperation': 'true'
              },
              data: {
                params: {
                  document: response.data.uid,
                  save: 'true',
                  xpath: 'file:content'
                }
              },
              transformRequest: function (data) {
                var formData = new FormData();
                // need to convert our json object to a string version of json otherwise
                // the browser will do a 'toString()' on the object which will result
                // in the value '[Object object]' on the server.
                formData.append('request', new Blob([angular.toJson(data)], {
                  filename: 'request',
                  type: 'application/json+nxrequest'
                }));
                //now add all of the assigned files
                formData.append('file', file);
                return formData;
              }
            }, successCallback, errorCallback);
          }, errorCallback);

          // Then upload the file
          //$http({
          //  method: 'POST',
          //  url: url.file.upload,
          //  headers: {
          //    'X-NXVoidOperation': 'true',
          //    'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          //  }
          //}).then(function (response) {
          //  // this callback will be called asynchronously
          //  // when the response is available
          //}, function (response) {
          //  // called asynchronously if an error occurs
          //  // or server returns response with an error status.
          //});
        };

        this.delete = function (successCallback, errorCallback) {
          executeHttp({
            url: url.automate + '/Document.Delete',
            data: {
              input: 'doc:' + this.uid
            }
          }, successCallback, errorCallback);
        };
      };

      return Document;
    }]);