;(function( window, undefined ){ 
 'use strict';

angular.module('ngNuxeoSecurity', []);

angular.module('ngNuxeoClient', [
  'ngNuxeoQueryPart'
]);

angular.module('ngNuxeoQueryPart', [
  'ngNuxeoQuery'
]);

angular.module('ngNuxeoQuery', [
  'ng',
  'ngResource',
  'ngNuxeoSecurity'
])

  .constant('nuxeoConstants', {
    nuxeo: {
      baseURL: 'http://demo.nuxeo.local/nuxeo',
      apiPath: '/api/v1',
      automationPath: '/site/automation',
      timeout: 5 // Timeout in seconds
    }
  })

  .config(['$httpProvider', function ($httpProvider) {

    /*- SECURITY : REGISTER A REQUEST AUTH INTERCEPTOR ------------------------------------------------------ */
    $httpProvider.interceptors.push('userAuthInterceptor');
  }]);
angular.module('ngNuxeoClient')

  .factory('Automation', ['$injector', '$http', '$q', 'nuxeoConstants',
    function ($injector, $http, $q, cst) {

      function Automation() {
      }

      // Inherit
      Automation.prototype = {};
      Automation.prototype.constructor = Automation;

      Automation.prototype.automate = function (requestSpec, successCallback, errorCallback) {
        var that = this;
        return $http(angular.extend({
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'true',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          }
        }, requestSpec)).then(function (response) {
          // Extends root object with properties coming from nuxeo
          angular.extend(that, response.data);

          // Run the successCallback if available
          if (successCallback && angular.isFunction(successCallback)) {
            return successCallback(response);
          }
          // Don't forget to pass the object to other "then" methods
          return that;
        }, function (response) {
          // Run the errorCallback if available
          if (errorCallback && angular.isFunction(errorCallback)) {
            return errorCallback(response);
          }
          // Don't forget to pass the response to other "error" methods
          return $q.reject(response);
        });
      };

      return Automation;
    }]);
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
          return this.createInUserWorkspace(function (response) {
            if (response && response.data && response.data.uid) {
              upload(response.data);
            } else {
              errorCallback(response);
            }
          }, errorCallback);
        }
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

angular.module('ngNuxeoClient')

  .factory('Folder', ['Document', 'nuxeoUtils',
    function (Document, utils) {

      var Folder = utils.inherit(function Folder(folder) {
        // Default behaviour if no argument supplied
        folder = angular.extend({type: 'Folder'}, folder);

        // Call Parent function with argument
        Document.call(this, folder);
      }, Document);

      return Folder;
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('Query', [function () {

    var baseQuery = 'SELECT * FROM Document WHERE 1=1';

    var queryParts = [];

    this.addQueryPartProvider = function (queryPart) {
      queryParts.push(queryPart);
    };

    this.$get = ['$injector', 'queryService', '$log',
      function ($injector, queryService, $log) {

        /**
         * Compose Query object
         */
        var parts = [], defaultOptions = {};

        // Enrich Query with query providers
        queryParts.forEach(function (queryPart) {
          var Part = $injector.get(queryPart);

          angular.extend(Query.prototype, new Part());
          if (angular.isObject(Part.defaultOptions)) {
            angular.extend(defaultOptions, Part.defaultOptions);
          }
          if (angular.isFunction(Part.getPart)) {
            parts.push(Part.getPart);
          }
        }, this);

        /**
         * Query constructor
         * @param query
         * @constructor
         */
        function Query(query) {
          this.options = angular.copy(defaultOptions);
          angular.extend(this, query);
        }

        /**
         * Get nuxeo query headers
         * @param headerName
         * @returns {Array}
         */
        Query.prototype.getHeaders = function (headerName) {

          var result = [];

          function getHeader(headers) {
            var result = [];
            if (headers && headers[headerName]) {
              var header = headers[headerName];
              if (angular.isArray(header)) {
                result = result.concat(header);
              } else if (angular.isString(header)) {
                result.push(header);
              }
            }
            return result;
          }

          if (this.headers) {
            result = getHeader(this.headers);
          } else {
            var Constr = this.DocumentConstructor;
            while (Constr) {
              result = result.concat(getHeader(Constr.headers));
              Constr = Constr.super;
            }
          }

          return result;
        };

        /**
         * Fetch result of query on nuxeo
         * @param successCallback
         * @param errorCallback
         */
        Query.prototype.$get = function (successCallback, errorCallback) {

          var that = this,
            nuxeo = $injector.get('nuxeo'),
            nuxeoUser = $injector.get('nuxeoUser');

          nuxeoUser.promise.then(function (user) {

            $log.debug(user);

            // Build query
            that.nxql = {query: baseQuery};
            parts.forEach(function (getPart) {
              var result = getPart(that.options, user);
              if (result) {
                if (angular.isString(result)) {
                  that.nxql.query += result;
                } else if (angular.isObject(result)) {
                  angular.extend(that.nxql, result);
                }
              }
            });

            // Log query
            $log.debug('Resulting query: ' + that.nxql.query);

            // Fetch query in nuxeo and transform result into Document Type
            return queryService.query(that, function (response) {
              var data = response.data;
              data.entries = data.entries.map(function (entry) {
                if (nuxeo.hasOwnProperty(entry.type)) {
                  return new nuxeo[entry.type](entry);
                } else {
                  return new nuxeo.Document(entry);
                }
              });

              // Add custom properties
              /* jshint -W064 */
              angular.extend(data, {
                pages: Array.apply(null, Array(data.pageCount)).map(function (x, i) {
                  return i;
                }),
                pageNumber: data.pageIndex + 1
              });
              /* jshint +W034 */

              return data;
            }, errorCallback).then(successCallback);
          });
        };

        return Query;
      }];
  }]);
angular.module('ngNuxeoClient')

  .factory('Section', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Section = utils.inherit(function Section(section) {
        // Default behaviour if no argument supplied
        section = angular.extend({path: Section.prototype.defaultPath, type: 'Section'}, section);

        // Call Parent function with argument
        Folder.call(this, section);
      }, Folder);

      // Inherit
      Section.prototype.defaultPath = '/default-domain/sections';

      return Section;
    }]);
angular.module('ngNuxeoClient')

  .factory('Workspace', ['Folder', 'nuxeoUtils',
    function (Folder, utils) {

      var Workspace = utils.inherit(function Workspace(workspace) {
        // Default behaviour if no argument supplied
        angular.extend(this, {type: 'Workspace'});

        // Call Parent function with argument
        if (workspace) {
          Folder.call(this, workspace);
        }
      }, Folder);

      return Workspace;
    }]);
angular.module('ngNuxeoSecurity')

  .service('basicAuthInterceptor', ['$q', 'nuxeoConstants', '$log',
    function ($q, cst, $log) {

      var basicAuthDefer = $q.defer();

      return {
        setUser: function (user) {
          basicAuthDefer.resolve(user);
        },

        request: function (config) {

          // DO NOT DEFER NON API REQUEST
          if (config.url.indexOf(cst.nuxeo.baseURL) !== 0) {
            return config;
          }

          $log.debug('basicAuthInterceptor: ' + config.method + ' - ' + config.url);

          // REQUESTS ARE DEFERRED UNTIL USER IS RESOLVED
          var deferred = $q.defer();
          basicAuthDefer.promise.then(function (user) {
            config.headers = config.headers || {};
            config.headers.Authorization = 'Basic ' + window.btoa(user.userName + ':' + user.password);
            deferred.resolve(config);
          });
          return deferred.promise;
        }
      };
    }]);
angular.module('ngNuxeoSecurity')

  .service('userAuthInterceptor', ['$q', '$injector', 'nuxeoConstants', 'nuxeoUrl', '$log',
    function ($q, $injector, cst, url, $log) {
      return {
        request: function (config) {

          // DO NOT DEFER NON API REQUEST
          if (config.url.indexOf(cst.nuxeo.baseURL) !== 0) {
            return config;
          }

          // DO NOT DEFER USER INDEPENDENT REQUEST
          if (!config.isUserDependent) {
            return config;
          }

          $log.debug('userAuthInterceptor: ' + config.method + ' - ' + config.url);

          var nuxeoUser = $injector.get('nuxeoUser');

          // REQUESTS ARE DEFERED UNTIL USER IS RESOLVED
          var deferred = $q.defer();
          nuxeoUser.promise.then(function () {
            deferred.resolve(config);
          });
          return deferred.promise;
        }
      };
    }]);
angular.module('ngNuxeoSecurity')

  .service('nuxeoUser', ['$q', '$injector', '$resource', 'nuxeoUrl', 'nuxeoUtils',
    function ($q, $injector, $resource, url, utils) {

      var User = $resource(url.user, {userName: '@userName'});

      var defer = $q.defer();

      var nuxeoUser = new User({promise: defer.promise});

      /**
       * Log the user in
       * @param userName
       * @param password
       */
      nuxeoUser.login = function (userName, password) {
        if (!userName && !(userName = this.userName)) {
          throw 'a userName must be defined';
        }

        if ($injector.has('basicAuthInterceptor')) {
          if (!password && !(password = this.password)) {
            throw 'a password must be defined';
          }

          var basicAuth = $injector.get('basicAuthInterceptor');
          basicAuth.setUser({userName: userName, password: password});
        }

        User.get({userName: userName}, function (user) {
          if (user && user.id) {
            user.pathId = utils.generateId(user.id, '-', false, 30);
          }
          defer.resolve(angular.extend(nuxeoUser, user));
        }, function () {
          throw 'Error while retrieving current user';
        });
      };

      return nuxeoUser;
    }]);
angular.module('ngNuxeoClient')

  .service('NuxeoDirectory', ['$resource', 'nuxeoUrl',
    function ($resource, url) {

      var request = function (object) {
        return $resource(url.request, {object: object});
      };

      this.continents = request('continent');

      this.countries = request('country');

      this.natures = request('nature');

      this.subjects = request('l10nsubjects');

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryCoverage', ['QueryProvider',
    function (Query) {

      Query.addQueryPartProvider('NuxeoQueryCoverage');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have target coverage
           * @param coverage
           * @returns {QueryPart}
           */
          this.withCoverage = function (coverage) {
            if (coverage && coverage.properties && !coverage.properties.noFilter) {
              if (coverage.directoryName === 'continent') {
                this.options.continentId = coverage.properties.id;
              } else if (coverage.directoryName === 'country') {
                this.options.country = coverage.properties;
              }
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          var continentId = options.continentId;
          var country = options.country;
          if (angular.isString(continentId)) {
            return continentId.length ? ' AND (dc:coverage STARTSWITH \'' + continentId + '\')' : '';
          } else if (angular.isObject(country)) {
            return ' AND (dc:coverage = \'' + country.parent + '/' + country.id + '\')';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryExpiration', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryExpiration');

      this.$get = ['$filter', function ($filter) {
        var QueryPart = function () {
          /**
           * Documents must not be expired
           * @returns {QueryPart}
           */
          this.excludeExpired = function () {
            this.options.excludeExpired = true;
            return this;
          };
          /**
           * Documents can be expired
           * @returns {QueryPart}
           */
          this.includeExpired = function () {
            this.options.excludeExpired = false;
            return this;
          };
        };

        QueryPart.defaultOptions = {excludeExpired: true};

        QueryPart.getPart = function (options) {
          if (options.excludeExpired) {
            return ' AND (dc:expired IS NULL OR dc:expired >= DATE \'' + $filter('date')(new Date(), 'yyyy-MM-dd') + '\')';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMedia', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryMedia');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Excludes some media type from search query
           * @param mediaTypes, Array of excluded mediaTypes
           * @returns {QueryPart}
           */
          this.excludeMedia = function (mediaTypes) {
            this.options.excludeMediaTypes = mediaTypes;
            return this;
          };
          /**
           * Includes some media type from search query
           * @param mediaTypes
           * @returns {QueryPart}
           */
          this.withMedia = function (mediaTypes) {
            this.options.mediaTypes = mediaTypes;
            return this;
          };
        };

        QueryPart.defaultOptions = {
          // Rather use mixin exlusion = 'Folderish' and 'HiddenInNavigation'
          excludeMediaTypes: [
            'Favorites'
            //'Domain', 'Section', 'UserProfile', 'Workspace',
            //'AdministrativeStatusContainer', 'AdministrativeStatus',
            //'DocumentRoute', 'Favorites', 'RouteNode',
            //'DocumentRouteModelsRoot', 'ManagementRoot', 'SectionRoot', 'TaskRoot', 'TemplateRoot', 'UserWorkspacesRoot', 'WorkspaceRoot'
          ]
        };

        QueryPart.getPart = function (options) {
          // Exclusion
          var criterias = '';

          var excl = options.excludeMediaTypes;
          if (angular.isArray(excl) && excl.length) {
            criterias += ' AND ecm:primaryType NOT IN (\'' + excl.join('\',\'') + '\')';
          } else if (angular.isString(excl) && excl.length) {
            criterias += ' AND ecm:primaryType <> \'' + excl + '\'';
          }

          // Inclusion
          var incl = options.mediaTypes;

          // Transform if Object => Array
          if (angular.isObject(incl)) {
            incl = Object.keys(incl).reduce(function (result, key) {
              if (incl[key]) {
                result.push(key);
              }
              return result;
            }, []);
          }

          if (angular.isArray(incl) && incl.length) {
            criterias += ' AND ecm:primaryType IN (\'' + incl.join('\',\'') + '\')';
          } else if (angular.isString(options.mediaTypes) && options.mediaTypes.length) {
            criterias += ' AND ecm:primaryType = \'' + options.mediaTypes + '\'';
          }

          return criterias;
        };

        return QueryPart;
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMixin', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryMixin');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Excludes some document facets from search query
           * @param mixin, Array of excluded mixin
           * @returns {*}
           */
          this.excludeMixin = function (mixin) {
            this.options.excludeMixinTypes = mixin;
            return this;
          };
          /**
           * Includes some document facets from search query
           * @param mixin, Array of excluded mixin
           * @returns {QueryPart}
           */
          this.withMixin = function (mixin) {
            this.options.mixin = mixin;
            return this;
          };
        };

        QueryPart.defaultOptions = {
          excludeMixinTypes: [
            'Folderish',
            'HiddenInNavigation'
          ]
        };

        QueryPart.getPart = function (options) {
          // Exclusion
          var criterias = '';

          var excl = options.excludeMixinTypes;
          if (angular.isArray(excl) && excl.length) {
            criterias += ' AND ecm:mixinType NOT IN (\'' + excl.join('\',\'') + '\')';
          } else if (angular.isString(excl) && excl.length) {
            criterias += ' AND ecm:mixinType <> \'' + excl + '\'';
          }

          // Inclusion
          var incl = options.mixin;

          // Transform if Object => Array
          if (angular.isObject(incl)) {
            incl = Object.keys(incl).reduce(function (result, key) {
              if (incl[key]) {
                result.push(key);
              }
              return result;
            }, []);
          }

          if (angular.isArray(incl) && incl.length) {
            criterias += ' AND ecm:mixinType IN (\'' + incl.join('\',\'') + '\')';
          } else if (angular.isString(options.mediaTypes) && options.mediaTypes.length) {
            criterias += ' AND ecm:mixinType = \'' + options.mediaTypes + '\'';
          }

          return criterias;
        };

        return QueryPart;
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryNature', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryNature');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have target nature
           * @param nature
           * @returns {QueryPart}
           */
          this.withNature = function (nature) {
            if (nature && nature.properties && !nature.properties.noFilter) {
              this.options.natureId = nature.properties.id;
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          var natureId = options.natureId;
          if (angular.isString(natureId)) {
            return natureId.length ? ' AND (dc:nature = \'' + natureId + '\')' : '';
          }
          return '';
        };

        return QueryPart;
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPaginate', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryPaginate');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Document pagination
           * @param size, page size
           * @param index, page index
           * @returns {QueryPart}
           */
          this.paginate = function (size, index) {
            this.options.size = size;
            this.options.index = index;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isDefined(options.size) && angular.isDefined(options.index)) {
            return {pageSize: options.size, currentPageIndex: options.index};
          }
          return null;
        };

        return QueryPart;
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryParent', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryParent');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have parents that have one of the targeted parent id
           * @param parentIds
           * @returns {QueryPart}
           */
          this.withParentIn = function (parentIds) {
            this.options.parentIds = parentIds;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isArray(options.parentIds)) {
            return options.parentIds.length ? ' AND ecm:parentId IN (\'' + options.parentIds.join('\',\'') + '\')' : '';
          } else if (angular.isString(options.parentIds) && options.parentIds.length) {
            return ' AND (ecm:parentId = \'' + options.parentIds + '\')';
          }
          return '';
        };

        return QueryPart;
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPath', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryPath');

      this.$get = [function () {

        function pathQuery(val) {
          return '(ecm:path STARTSWITH \'' + val + '\')';
        }

        function addPath(options, path, negate) {
          if (!angular.isString(path)) {
            throw 'Path should be a String';
          }
          if (angular.isUndefined(options.paths)) {
            options.paths = [];
          }
          options.paths.push({value: path, negate: negate});
        }

        var QueryPart = function () {
          /**
           * Documents have to be placed in target path
           * @param path
           * @returns {*}
           */
          this.inPath = function (path) {
            addPath(this.options, path);
            return this;
          };
          /**
           * Documents have to be placed in target domain workspace
           * @param domainName domain name
           * @param subPath a subPath where searching documents
           * @returns {*}
           */
          this.inDomainWorkspace = function (domainName, subPath) {
            addPath(this.options, '/' + domainName + '/workspaces' + (subPath ? '/' + subPath : ''));
            return this;
          };
          /**
           * Documents have to be placed in default type path
           * @returns {*}
           */
          this.inDefaultPath = function () {
            addPath(this.options, this.DocumentConstructor.prototype.defaultPath);
            return this;
          };
          /**
           * Documents have to be placed in user's personal workspace
           * @returns {*}
           */
          this.inUserWorkspace = function (subPath) {
            this.options.userSubPath = subPath || true;
            return this;
          };
          /**
           * Documents are not in any user's personal workspace
           * @returns {*}
           */
          this.notInUserWorkspace = function () {
            this.options.notInUserWorkspace = true;
            return this;
          };
        };

        QueryPart.getPart = function (options, user) {
          if (options.userSubPath) {
            var userDirectory = '/default-domain/UserWorkspaces/' + user.pathId;
            if (angular.isString(options.userSubPath)) {
              userDirectory += '/' + options.userSubPath;
            }
            addPath(options, userDirectory);
            if (options.notInUserWorkspace) {
              throw 'InUserWorkspace and notInUserWorkspace both present, watch your query options!';
            }
          }
          if (options.notInUserWorkspace) {
            addPath(options, '/default-domain/UserWorkspaces/', true);
          }

          if (angular.isArray(options.paths)) {
            var terms = options.paths.reduce(function (result, path) {
              if (path.value.length) {
                result += (result.length ? ' OR ' : '' ) + (path.negate ? 'NOT' : '') + pathQuery(path.value);
              }
              return result;
            }, '');
            return terms.length ? ' AND (' + terms + ')' : '';
          } else if (angular.isString(options.paths) && options.paths.length) {
            return ' AND ' + pathQuery(options.paths);
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySorter', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQuerySorter');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Document sorting
           * @param properties, properties to be sorted
           * @param orders, order type [ASC | DESC] for each property
           * @returns {QueryPart}
           */
          this.sortBy = function (properties, orders) {
            if (angular.isArray(properties)) {
              this.options.sortBy = properties;
              if (angular.isArray(orders) && orders.length) {
                this.options.sortOrder = [orders];
              } else {
                this.options.sortOrder = [];
                properties.forEach(function () {
                  this.options.sortOrder.push('ASC');
                }, this);
              }
            } else if (angular.isObject(properties)) {
              this.options.sortBy = [];
              this.options.sortOrder = [];
              Object.keys(properties).forEach(function (key) {
                this.options.sortBy.push(key);
                this.options.sortOrder.push(properties[key]);
              }, this);
            } else if (angular.isString(properties)) {
              this.options.sortBy = [properties];
              if (angular.isString(orders) && orders.length) {
                this.options.sortOrder = [orders];
              } else {
                this.options.sortOrder = ['ASC'];
              }
            } else {
              throw 'Should sort using an Array or String property';
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isDefined(options.sortBy)) {
            return {sortBy: options.sortBy.join(','), sortOrder: options.sortOrder.join(',')};
          }
          return null;
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryState', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryState');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must not be deleted
           * @returns {QueryPart}
           */
          this.excludeDeleted = function () {
            this.options.excludeDeleted = true;
            return this;
          };
          /**
           * Documents can be deleted
           * @returns {QueryPart}
           */
          this.includeDeleted = function () {
            this.options.excludeDeleted = false;
            return this;
          };
        };

        QueryPart.defaultOptions = {excludeDeleted: true};

        QueryPart.getPart = function (options) {
          if (options.excludeDeleted) {
            return ' AND ecm:currentLifeCycleState <> \'deleted\'';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySubject', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQuerySubject');

      function map(subjectId) {
        return {
          'arts': 'Art',
          'business': 'Art',
          'computers': 'Art',
          'games': 'Art',
          'health': 'Art',
          'home': 'Art',
          'kids-and-teens': 'Art',
          'news': 'Art',
          'recreation': 'Art',
          'reference': 'Art',
          'regional': 'Art',
          'science': 'Art',
          'shopping': 'Art',
          'society': 'Art',
          'sports': 'Art'
        }[subjectId];
      }

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must have target subject
           * @param subject
           * @returns {QueryPart}
           */
          this.withSubject = function (subject) {
            if (subject && subject.properties && !subject.properties.noFilter) {
              this.options.subjectId = subject.properties.id;
            }
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          var subjectId = options.subjectId;
          if (angular.isString(subjectId)) {
            return subjectId.length ? ' AND (dc:subjects STARTSWITH \'' + map(subjectId) + '\')' : '';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryTerm', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryTerm');

      this.$get = [function () {

        function termsQuery(val) {
          return '(dc:title like \'%' + val + '%\')';
        }

        var QueryPart = function () {
          /**
           * Documents must have target terms
           * @param terms
           * @returns {QueryPart}
           */
          this.withTerms = function (terms) {
            this.options.terms = terms;
            return this;
          };
        };

        QueryPart.getPart = function (options) {
          if (angular.isArray(options.terms)) {
            var terms = options.terms.reduce(function (result, val) {
              if (val.length) {
                result += (result.length ? ' OR ' : '' ) + termsQuery(val);
              }
              return result;
            }, '');
            return terms.length ? ' AND (' + terms + ')' : '';
          } else if (angular.isString(options.terms) && options.terms.length) {
            return ' AND ' + termsQuery(options.terms);
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
angular.module('ngNuxeoQueryPart')

  .service('queryService', ['$http', 'nuxeoUrl', 'nuxeoConstants',
    function ($http, url, cst) {

      var getConfig = function (query) {
        return {
          params: query.nxql,
          headers: {
            /**
             * @see https://doc.nuxeo.com/display/NXDOC/Special+HTTP+Headers
             * Possible values: dublincore, file, picture, *,...
             */
            'X-NXproperties': function () {
              return query.getHeaders('nxProperties').join(',');
            },
            /**
             * @see https://doc.nuxeo.com/display/NXDOC/Content+Enricher
             * Possible values: thumbnail, acls, preview, breadcrumb
             */
            'X-NXenrichers.document': 'thumbnail',
            /**
             * This header can be used when you want to control the transaction duration in seconds
             */
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          },
          isUserDependent: true
        };
      };

      this.query = function (query, successCallback, errorCallback) {
        return $http.get(url.query, getConfig(query)).then(successCallback, errorCallback);
      };
    }]);
angular.module('ngNuxeoClient')

  .service('nuxeo', ['$injector', 'Automation', 'Document', 'Folder', 'Section', 'Workspace', 'NuxeoDirectory', 'NuxeoTag',
    function ($injector, Automation, Document, Folder, Section, Workspace, NuxeoDirectory, NuxeoTag) {

      /**
       * All basic nuxeo services are registered here
       */
      angular.extend(this, {
        Automation: Automation,
        Document: Document,
        Folder: Folder,
        Section: Section,
        Workspace: Workspace,
        continents: NuxeoDirectory.continents,
        countries: NuxeoDirectory.countries,
        natures: NuxeoDirectory.natures,
        subjects: NuxeoDirectory.subjects,
        tags: NuxeoTag
      });

      this.register = function (service, name) {
        if (angular.isFunction(service) && name && !this.hasOwnProperty(name)) {
          this[name] = $injector.get(name);
        } else {
          throw 'Nuxeo service registration failed for service [' + service + ']';
        }
      };
    }]);
angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['Query',
    function () {

      //var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.$get = function () {
        // TODO
        return null; //new Query(tagQuery).$get(successCallback, errorCallback);
      };
    }]);
angular.module('ngNuxeoClient')

  .service('nuxeoUtils', [function () {

    function removeDiacritics(str) {

      var defaultDiacriticsRemovalMap = [
        {base: 'A', letters: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
        {base: 'AA', letters: /[\uA732]/g},
        {base: 'AE', letters: /[\u00C6\u01FC\u01E2]/g},
        {base: 'AO', letters: /[\uA734]/g},
        {base: 'AU', letters: /[\uA736]/g},
        {base: 'AV', letters: /[\uA738\uA73A]/g},
        {base: 'AY', letters: /[\uA73C]/g},
        {base: 'B', letters: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
        {base: 'C', letters: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
        {base: 'D', letters: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
        {base: 'DZ', letters: /[\u01F1\u01C4]/g},
        {base: 'Dz', letters: /[\u01F2\u01C5]/g},
        {base: 'E', letters: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
        {base: 'F', letters: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
        {base: 'G', letters: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
        {base: 'H', letters: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
        {base: 'I', letters: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
        {base: 'J', letters: /[\u004A\u24BF\uFF2A\u0134\u0248]/g},
        {base: 'K', letters: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
        {base: 'L', letters: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
        {base: 'LJ', letters: /[\u01C7]/g},
        {base: 'Lj', letters: /[\u01C8]/g},
        {base: 'M', letters: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
        {base: 'N', letters: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
        {base: 'NJ', letters: /[\u01CA]/g},
        {base: 'Nj', letters: /[\u01CB]/g},
        {base: 'O',letters: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
        {base: 'OI', letters: /[\u01A2]/g},
        {base: 'OO', letters: /[\uA74E]/g},
        {base: 'OU', letters: /[\u0222]/g},
        {base: 'P', letters: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
        {base: 'Q', letters: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
        {base: 'R', letters: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
        {base: 'S', letters: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
        {base: 'T', letters: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
        {base: 'TZ', letters: /[\uA728]/g},
        {base: 'U', letters: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
        {base: 'V', letters: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
        {base: 'VY', letters: /[\uA760]/g},
        {base: 'W', letters: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
        {base: 'X', letters: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
        {base: 'Y', letters: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
        {base: 'Z', letters: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
        {base: 'a', letters: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
        {base: 'aa', letters: /[\uA733]/g},
        {base: 'ae', letters: /[\u00E6\u01FD\u01E3]/g},
        {base: 'ao', letters: /[\uA735]/g},
        {base: 'au', letters: /[\uA737]/g},
        {base: 'av', letters: /[\uA739\uA73B]/g},
        {base: 'ay', letters: /[\uA73D]/g},
        {base: 'b', letters: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
        {base: 'c', letters: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
        {base: 'd', letters: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
        {base: 'dz', letters: /[\u01F3\u01C6]/g},
        {base: 'e', letters: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
        {base: 'f', letters: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
        {base: 'g', letters: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
        {base: 'h', letters: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
        {base: 'hv', letters: /[\u0195]/g},
        {base: 'i', letters: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
        {base: 'j', letters: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
        {base: 'k', letters: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
        {base: 'l', letters: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
        {base: 'lj', letters: /[\u01C9]/g},
        {base: 'm', letters: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
        {base: 'n', letters: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
        {base: 'nj', letters: /[\u01CC]/g},
        {base: 'o', letters: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
        {base: 'oi', letters: /[\u01A3]/g},
        {base: 'ou', letters: /[\u0223]/g},
        {base: 'oo', letters: /[\uA74F]/g},
        {base: 'p', letters: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
        {base: 'q', letters: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
        {base: 'r', letters: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
        {base: 's', letters: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
        {base: 't', letters: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
        {base: 'tz', letters: /[\uA729]/g},
        {base: 'u', letters: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
        {base: 'v', letters: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
        {base: 'vy', letters: /[\uA761]/g},
        {base: 'w', letters: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
        {base: 'x', letters: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
        {base: 'y', letters: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
        {base: 'z', letters: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
      ];

      for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
        str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
      }

      return str;
    }

    return {

      generateId: function (s, wordSeparator, lower, maxChars) {
        s = removeDiacritics(s);
        s = s.trim();
        if (lower) {
          s = s.toLowerCase();
        }
        var words = s.split(/[^a-zA-Z0-9]+/);
        // remove blank chars from words, did not get why they're not filtered
        var wordsList = [];
        words.forEach(function (word) {
          if (word !== null && word.length > 0) {
            wordsList.push(word);
          }
        });

        var id = '';
        if (maxChars > 0) {
          // be sure at least one word is used
          id += wordsList[0];
          for (var i = 1; i < wordsList.length; i++) {
            var newWord = wordsList[i];
            if (id.length + newWord.length > maxChars) {
              break;
            } else {
              id += wordSeparator + newWord;
            }
          }
          id = id.substring(0, Math.min(id.length, maxChars));
        } else {
          throw 'GenerateId should not be used with maxChars <= 0';
        }
        return id;
      },

      removeDiacritics: removeDiacritics,

      /**
       * Inherit
       */
      inherit: function inherit(NewType, ParentType) {

        if (!angular.isFunction(NewType) || !angular.isFunction(ParentType)) {
          throw 'New type and parent type in hierarchy should be Function';
        }

        // Inherit
        NewType.prototype = new ParentType();
        NewType.prototype.constructor = NewType;

        // Static methods
        angular.extend(NewType, ParentType);

        // Add a super static method
        NewType.super = ParentType;

        return NewType;
      }
    };
  }]);
angular.module('ngNuxeoClient')

  .service('nuxeoUrl', ['nuxeoConstants',
    function (cst) {

      var apiBase = cst.nuxeo.baseURL + cst.nuxeo.apiPath, automationBase = cst.nuxeo.baseURL + cst.nuxeo.automationPath;

      this.automate = automationBase;

      this.request = apiBase + '/directory/:object';

      this.query = apiBase + '/query';

      this.user = apiBase + '/user/:userName';
    }]);}( window ));