angular.module('ngNuxeoClient')

  .factory('Document', ['Automation', 'nuxeoUtils', 'nuxeoUser', 'nuxeoUrl', 'Query', '$log',
    function (Automation, utils, user, url, Query, $log) {

      var Document = utils.inherit(function Document(document) {
        // Default behaviour if no argument supplied
        angular.extend(this, document);

        // Put some shortcuts on nuxeo properties
        if (document) {

          // Call Parent function with argument - NOT USEFUL as nothing done in constructor
          // Automation.call(this, document);

          var ctx = this.contextParameters;
          if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
            this.thumbnailUrl = ctx.thumbnail.url;
          }

          var properties = this.properties;
          if (properties) {
            var fileContent = properties['file:content'];
            if (fileContent && fileContent.data) {
              this.srcUrl = fileContent.data;
            }
          }

          var isInUserworspace = !!(this.path && user.workspace && this.path.indexOf(user.workspace.pathId) === 0);

          this.isPublishable = !!(this.facets && this.facets.indexOf('Immutable') === -1);

          this.isMine = !!(properties && properties['dc:creator'] && properties['dc:creator'] === user.id);

          this.isDeletable = !!(this.isMine || isInUserworspace);
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
            params: angular.extend({type: this.type}, this),
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
       * Move Nuxeo Document to a Folder
       * @param folder
       * @param successCallback
       * @param errorCallback
       * @returns a Promise
       */
      Document.prototype.move = function (folder, successCallback, errorCallback) {
        return this.automate({
          url: url.automate + '/Document.Move',
          headers: {
            'X-NXVoidOperation': 'false'
          },
          data: {
            input: this.path,
            params: {target: folder.uid},
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

        var self = this;

        // First create a document
        var upload = function (entry) {
          self.automate({
            url: url.automate + '/Blob.AttachOnDocument',
            headers: {
              'Content-Type': 'multipart/form-data',
              'X-NXVoidOperation': 'true'
            },
            data: {
              params: {
                document: entry.uid,
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
              // now add all of the assigned files
              try {
                // Should work in latest versions of chrome and firefox
                formData.append('file', file, file.name || 'descriptor.json');
              } catch (e) {
                // Else use the plain old standard method
                formData.append('file', file);
              }
              return formData;
            }
          }, function () {
            successCallback(entry);
          }, errorCallback);
        };

        // If document exists with a valid uid, no need to create one
        if (this.uid) {
          upload(this);
        } else {
          // Else creates the document in user workspace before uploading
          return this.createInUserWorkspace(upload, errorCallback);
        }
      };

      /**
       * Create a Nuxeo Document in User workspace
       */
      Document.prototype.createInUserWorkspace = function (successCallback, errorCallback) {
        return this.create(user.workspace.pathId, successCallback, errorCallback);
      };

      /**
       * Return true is document is an instance of target type
       * @param type
       */
      Document.prototype.is = function (type) {
        return this.type === type;
      };

      /**
       * Fold this Document with another Nuxeo Document
       * @param document
       * @param successCallback
       * @param errorCallback
       */
      Document.prototype.fold = function (document, successCallback, errorCallback) {
        var self = this;
        var sourceIsFolder = this.is('Folder');
        var targetIsFolder = document.is('Folder');

        if (sourceIsFolder && targetIsFolder) {
          errorCallback('Could not fold two folders');
        } else if (sourceIsFolder || targetIsFolder) {
          if (sourceIsFolder) {
            document.move(this, successCallback, errorCallback);
          } else {
            this.move(document, successCallback, errorCallback);
          }
        } else {
          var name = 'Untitled Folder';
          return new Document({
            name: name,
            type: 'Folder',
            properties: 'dc:title=' + name + '\ndc:description=' + name
          }).createInUserWorkspace(function (folder) {
            self.move(folder, function () {
              document.move(folder, successCallback, errorCallback);
            });
          }, errorCallback);
        }
      };

      /**
       * Download Nuxeo Document content
       * @param successCallback
       * @param errorCallback
       * @returns a Promise
       */
      Document.prototype.download = function (successCallback, errorCallback) {
        return this.automate({
          url: url.automate + '/Document.GetBlob',
          headers: {
            'X-NXVoidOperation': 'false'
          },
          data: {
            input: this.path,
            params: {xpath: 'file:content'}
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

      // Media type
      Document.prototype.type = 'Document';

      Document.prototype.defaultPath = '/default-domain/workspaces';

      Document.headers = {'X-NXproperties': ['dublincore', 'file']};

      //**********************************************************
      // STATIC METHODS
      //**********************************************************

      Document.create = function (params, inPath, successCallback, errorCallback) {
        return new this.prototype.constructor(params).create(inPath, successCallback, errorCallback);
      };

      Document.query = function (params) {
        return new Query(angular.extend({
          DocumentConstructor: this.prototype.constructor
        }, params));
      };

      return Document;
    }]);
