angular.module('ngNuxeoClient')

  .factory('Document', ['Automation', 'nuxeoUtils', 'nuxeoUser', 'nuxeoUrl', 'Query', '$log',
    function (Automation, utils, user, url, Query, $log) {

      var Document = utils.inherit(function Document(document) {
        // Default behaviour if no argument supplied
        angular.extend(this, angular.extend({path: Document.prototype.defaultPath, type: 'Document'}, document || {}));

        // Put some shortcuts on nuxeo properties
        if (document) {

          // Call Parent function with argument - NOT USEFUL as nothing done in constructor
          // Automation.call(this, document);

          var ctx = this.contextParameters;
          if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
            this.thumbnailURL = ctx.thumbnail.url;
          }

          var properties = this.properties;
          if (properties) {
            var fileContent = properties['file:content'];
            if (fileContent && fileContent.data) {
              this.srcURL = fileContent.data;
            }
          }

          var isInUserworspace = this.path && this.path.indexOf('/default-domain/UserWorkspaces/' + user.pathId) === 0;

          this.isPublishable = this.facets && this.facets.indexOf('Immutable') === -1;

          this.isMine = properties && properties['dc:creator'] && properties['dc:creator'] === user.id;

          this.isDeletable = this.isMine || isInUserworspace;
        }
      }, Automation);

      //**********************************************************
      // PROTOTYPE INHERITANCE WILL USE THESE METHODS
      //**********************************************************

      /**
       * Create a Nuxeo Document
       * @param inPath
       * @param successCallback
       * @param errorCallback
       * @returns a Promise
       */
      Document.prototype.create = function (inPath, successCallback, errorCallback) {
        return this.automate({
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
       * Update a Nuxeo Document
       * @param successCallback
       * @param errorCallback
       * @returns a Promise
       */
      Document.prototype.update = function (successCallback, errorCallback) {
        return this.automate({
          url: url.automate + '/Document.Update',
          headers: {
            'X-NXVoidOperation': 'false'
          },
          data: {
            input: this.path,
            params: {properties: 'dc:title=' + this.title},
            context: {}
          }
        }, successCallback, errorCallback);
      };

      /**
       * Upload a file to Nuxeo Document
       * @param file
       * @param successCallback
       * @param errorCallback
       *
       */
      Document.prototype.upload = function (file, successCallback, errorCallback) {

        // First create a document
        var self = this;
        return this.createInUserWorkspace(function (response) {
          if (!response || !response.data || !response.data.uid) {
            errorCallback();
          }

          self.automate({
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
      };

      /**
       * Create a Nuxeo Document in User workspace
       */
      Document.prototype.createInUserWorkspace = function (successCallback, errorCallback) {
        return this.create('/default-domain/UserWorkspaces/' + user.pathId, successCallback, errorCallback);
      };

      /**
       * Download Nuxeo Document content
       * @param successCallback
       * @param errorCallback
       * @returns a Promise
       */
      Document.prototype.download = function (successCallback, errorCallback) {
        return this.automate({
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
       * Publish a Nuxeo Document
       * @param params
       * @param successCallback
       * @param errorCallback
       * @returns a Promise
       */
      Document.prototype.publish = function (params, successCallback, errorCallback) {
        if (!params.target) {
          $log.error('Publication target must be defined');
        }
        return this.automate({
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
      Document.prototype.delete = function (successCallback, errorCallback) {
        this.automate({
          url: url.automate + '/Document.Delete',
          data: {
            input: this.uid
          }
        }, successCallback, errorCallback);
      };

      Document.prototype.defaultPath = '/default-domain/workspaces';

      Document.headers = {nxProperties: ['dublincore', 'file']};

      //**********************************************************
      // STATIC METHODS
      //**********************************************************

      Document.create = function (params, inPath, successCallback, errorCallback) {
        return new this.prototype.constructor(params).create(inPath, successCallback, errorCallback);
      };

      Document.query = function (params) {
        return new Query(angular.extend({
          DocumentConstructor: this.prototype.constructor,
        }, params));
      };

      return Document;
    }]);
