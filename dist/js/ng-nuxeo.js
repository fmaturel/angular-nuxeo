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
              // now add all of the assigned files
              try {
                // Should work in latests versions of chrome and firefox
                formData.append('file', file, file.name || 'descriptor.json');
              } catch (e) {
                // Else use the plain old standard method
                formData.append('file', file);
              }
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

  .service('nuxeoUser', ['$q', '$injector', '$resource', 'nuxeoUrl',
    function ($q, $injector, $resource, url) {

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
            user.pathId = user.id.replace(/[@\.]/g, '-').substring(0, 30);
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

    return {

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