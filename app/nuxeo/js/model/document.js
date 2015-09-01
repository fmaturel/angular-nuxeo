angular.module('ngNuxeoClient')

  .factory('Document', ['$injector', 'nuxeoUrl', 'nuxeoAutomate',
    function ($injector, url, nuxeoAutomate) {

      function Document(document) {

        angular.extend(this, document);

        /**
         * Create a Nuxeo Document
         * @param inPath
         * @param successCallback
         * @param errorCallback
         * @returns a Promise
         */
        this.create = function (inPath, successCallback, errorCallback) {
          return nuxeoAutomate(this, {
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

        /**
         * Download Nuxeo Document content
         * @param successCallback
         * @param errorCallback
         * @returns {*}
         */
        this.download = function (successCallback, errorCallback) {
          return nuxeoAutomate(this, {
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

        /**
         * Upload a file to Nuxeo Document
         * @param file
         * @param successCallback
         * @param errorCallback
         */
        this.upload = function (file, successCallback, errorCallback) {

          var that = this, nuxeoUserPromise = $injector.get('nuxeoUserPromise');

          nuxeoUserPromise.then(function (user) {

            // First create a document
            that.create('doc:/default-domain/UserWorkspaces/' + user.pathId, function (response) {
              if (!response || !response.data || !response.data.uid) {
                errorCallback();
              }

              nuxeoAutomate(this, {
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
          });
        };

        /**
         * Publish a Nuxeo Document
         * @param params
         * @param successCallback
         * @param errorCallback
         */
        this.publish = function (params, successCallback, errorCallback) {
          nuxeoAutomate(this, {
            url: url.automate + '/Document.PublishToSection',
            headers: {
              'X-NXVoidOperation': 'false'
            },
            data: {
              input: this.uid,
              params: angular.extend({
                override: 'true'
              }, params)
            }
          }, successCallback, errorCallback);
        };

        /**
         * Delete a Nuxeo Document
         * @param successCallback
         * @param errorCallback
         */
        this.delete = function (successCallback, errorCallback) {
          nuxeoAutomate(this, {
            url: url.automate + '/Document.Delete',
            data: {
              input: this.uid
            }
          }, successCallback, errorCallback);
        };
      }

      // Inherit
      Document.prototype = {};
      Document.prototype.constructor = Document;

      Document.create = function (params, inPath, successCallback, errorCallback) {
        return new this.prototype.constructor(params).create(inPath, successCallback, errorCallback);
      };

      return Document;
    }]);