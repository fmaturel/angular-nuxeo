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
      apiPath: '/site/api/v1',
      automationPath: '/site/automation',
      timeout: 5 // Timeout in seconds
    }
  })

  .config(['$httpProvider', function ($httpProvider) {

    /*- SECURITY : REGISTER A REQUEST AUTH INTERCEPTOR ------------------------------------------------------ */
    $httpProvider.interceptors.push('userAuthInterceptor');
  }]);
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
angular.module('ngNuxeoClient')

  .factory('Folder', ['Document',
    function (Document) {

      function Folder(folder) {

        // Extend object
        angular.extend(this, folder ? angular.extend(folder, {type: 'Folder'}) : {type: 'Folder'});
      }

      // Inherit
      Folder.prototype = new Document();
      delete Folder.prototype.upload;
      Folder.prototype.constructor = Folder;
      Folder.prototype.defaultPath = '/default-domain/workspaces';

      // Static methods
      angular.extend(Folder, Document);

      return Folder;
    }]);
angular.module('ngNuxeoClient')

  .service('Query', ['$resource', 'nuxeoUrl', 'nuxeoConstants', 'Document', 'nuxeoUserPromise', '$log',
    function ($resource, url, cst, Document, nuxeoUserPromise, $log) {

      var getAction = {
        method: 'GET',
        headers: {
          /**
           * @see https://doc.nuxeo.com/display/NXDOC/Special+HTTP+Headers
           * Possible values: dublincore, file, *
           */
          'X-NXproperties': 'dublincore, file',
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

        /**
         * Transforms the response received from server
         * @param data
         * @returns {void|Object|*}
         */
        transformResponse: function (data) {
          var result = angular.fromJson(data);
          return angular.extend(result, {
            entries: angular.isArray(result.entries) ? result.entries.map(function (entry) {
              var document = new Document(entry);

              var ctx = entry.contextParameters;
              if (ctx && ctx.thumbnail && ctx.thumbnail.url) {
                document.thumbnailURL = ctx.thumbnail.url;
              }

              var fileContent = entry.properties['file:content'];
              if (fileContent && fileContent.data) {
                document.srcURL = fileContent.data;
              }

              document.isPublishable = (entry.facets.indexOf('Immutable') === -1);

              nuxeoUserPromise.then(function (user) {
                document.isDeletable = entry.path.startsWith('/default-domain/UserWorkspaces/' + user.pathId);
              });

              $log.debug(document.title + ' = ' + document.uid);
              return document;
            }) : []
          });
        }
      };

      var Query = $resource(url.query, {query: '@query'}, {get: getAction});

      return function (query, isUserDependent) {
        getAction.isUserDependent = isUserDependent;
        return new Query({query: query});
      };
    }]);
angular.module('ngNuxeoClient')

  .factory('Section', ['Folder',
    function (Folder) {

      function Section(folder) {
        // Extend object
        var base = {path : Section.defaultPath, type: 'Section'};
        angular.extend(this, folder ? angular.extend(folder, base) : base);
      }

      // Inherit
      Section.prototype = new Folder();
      Section.prototype.constructor = Section;
      Section.prototype.defaultPath = '/default-domain/sections';

      // Static methods
      angular.extend(Section, Folder);

      return Section;
    }]);
angular.module('ngNuxeoClient')

  .factory('User', ['$resource', 'nuxeoUrl',
    function ($resource, url) {

      var User = $resource(url.user, {userName: '@userName'}, {
        get: {
          transformResponse: function (data, headersGetter, status) {
            var result = angular.fromJson(data);
            if (status === 200) {
              result.pathId = result.id.replace(/[@\.]/g, '-');
            }
            return result;
          }
        }
      });

      return User;
    }]);
angular.module('ngNuxeoClient')

  .factory('Workspace', ['Folder',
    function (Folder) {

      function Workspace(folder) {
        // Extend object
        var base = {path : Workspace.defaultPath, type: 'Workspace'};
        angular.extend(this, folder ? angular.extend(folder, base) : base);
      }

      // Inherit
      Workspace.prototype = new Folder();
      Workspace.prototype.constructor = Workspace;
      Workspace.prototype.defaultPath = '/default-domain/workspaces';

      // Static methods
      angular.extend(Workspace, Folder);

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

          // DO NOT PROCESS NON API REQUEST
          if (!config.url.startsWith(cst.nuxeo.baseURL)) {
            return config;
          }

          // DO NOT PROCESS UNSECURED REQUEST
          if (config.unsecured) {
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

          // DO NOT PROCESS NON API REQUEST
          if (!config.url.startsWith(cst.nuxeo.baseURL)) {
            return config;
          }

          // DO NOT PROCESS USER INDEPENDENT REQUEST
          if (!config.isUserDependent) {
            return config;
          }

          $log.debug('userAuthInterceptor: ' + config.method + ' - ' + config.url);

          var nuxeoUserPromise = $injector.get('nuxeoUserPromise');

          // REQUESTS ARE DEFERED UNTIL USER IS RESOLVED
          var deferred = $q.defer();
          nuxeoUserPromise.then(function () {
            deferred.resolve(config);
          });
          return deferred.promise;
        }
      };
    }]);
angular.module('ngNuxeoSecurity')

  .service('nuxeoUser', ['$q', '$injector', 'User',
    function ($q, $injector, User) {

      var nuxeoUser = $q.defer();

      nuxeoUser.login = function (userName, password) {
        if(!userName && !(userName = this.userName)) {
          throw 'a userName must be defined';
        }

        var userResource = new User({userName: userName});

        if ($injector.has('basicAuthInterceptor')) {
          if(!password && !(password = this.password)) {
            throw 'a password must be defined';
          }

          var basicAuth = $injector.get('basicAuthInterceptor');
          basicAuth.setUser({userName: userName, password: password});
        }

        nuxeoUser.resolve(userResource.$get(function (user) {
          angular.extend(userResource, user);
        }, function () {
          throw 'Error while retrieving current user';
        }));
      };

      return nuxeoUser;
    }])

  .service('nuxeoUserPromise', ['nuxeoUser',
    function (nuxeoUser) {
      return nuxeoUser.promise;
    }]);
angular.module('ngNuxeoClient')

  .service('nuxeoAutomate', ['$http', '$q', 'nuxeoConstants',
    function ($http, $q, cst) {

      return function (object, requestSpec, successCallback, errorCallback) {
        return $http(angular.extend({
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'true',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          }
        }, requestSpec)).then(function (response) {
          // Extends root object with properties coming from nuxeo
          angular.extend(object, response.data);

          // Run the successCallback if available
          if (successCallback && angular.isFunction(successCallback)) {
            return successCallback(response);
          }
          // Don't forget to pass the object to other "then" methods
          return object;
        }, function (response) {
          // Run the errorCallback if available
          if (errorCallback && angular.isFunction(errorCallback)) {
            return errorCallback(response);
          }
          // Don't forget to pass the response to other "error" methods
          return $q.reject(response);
        });
      };
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

  .provider('NuxeoQueryCoverage', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryCoverage');

      this.$get = [function () {
        return function (options) {

          this.withCoverage = function (coverage) {
            if (coverage && coverage.properties) {
              if (coverage.directoryName === 'continent') {
                options.continentId = coverage.properties.id;
              } else if (coverage.directoryName === 'country') {
                options.country = coverage.properties;
              }
            }
            return this;
          };

          this.getPart = function () {
            var continentId = options.continentId;
            var country = options.country;
            if (angular.isString(continentId)) {
              return continentId.length ? ' AND (dc:coverage STARTSWITH \'' + continentId + '\')' : '';
            } else if (angular.isObject(country)) {
              return ' AND (dc:coverage = \'' + country.parent + '/' + country.id + '\')';
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryExpiration', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryExpiration');

      this.$get = ['$filter', function ($filter) {
        return function (options) {

          this.defaultOptions = {excludeExpired: true};

          this.excludeExpired = function () {
            options.excludeExpired = true;
            return this;
          };

          this.includeExpired = function () {
            options.excludeExpired = false;
            return this;
          };

          this.getPart = function () {
            if (options.excludeExpired) {
              return ' AND (dc:expired IS NULL OR dc:expired >= DATE \'' + $filter('date')(new Date(), 'yyyy-MM-dd') + '\')';
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoClient')

  .factory('NuxeoQueryFactory', ['$injector', 'Query', 'nuxeoUserPromise', '$log',
    function ($injector, Query, nuxeoUserPromise, $log) {

      var baseQuery = 'SELECT * FROM Document WHERE 1=1';

      return function (queryPartFactoryName) {

        var NuxeoQuery = function () {

          var options = {}, parts = [];

          // Enrich with query providers
          angular.forEach(queryPartFactoryName, function (factoryName) {
            var Part = $injector.get(factoryName);
            var part = new Part(options);

            angular.extend(this, new Part(options));
            if (angular.isObject(part.defaultOptions)) {
              angular.extend(options, part.defaultOptions);
            }
            if (angular.isFunction(part.getPart)) {
              parts.push({order: part.order || 0, getPart: part.getPart});
            }
          }, this);

          // Sort services by defined order
          parts = _.sortBy(parts, 'order').map(function (o) {
            return o.getPart;
          });

          //********************************** PUBLIC METHODS
          this.get = function (successCallback, errorCallback) {
            var doGet = function () {
              var query = baseQuery;
              angular.forEach(parts, function (getPart) {
                query += getPart();
              });
              $log.debug('Nuxeo query built by NuxeoQuery Service: ' + query);
              return new Query(query, true).$get(successCallback, errorCallback);
            };

            if(options.isUserDependent) {
              nuxeoUserPromise.then(doGet);
            } else {
              doGet();
            }
          };
        };

        return NuxeoQuery;
      };

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMedia', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryMedia');

      this.$get = [function () {
        return function (options) {

          this.defaultOptions = {
            // Rather use mixin exlusion = 'Folderish' and 'HiddenInNavigation'
            excludeMediaTypes: [
              'Favorites'
              //'Domain', 'Section', 'UserProfile', 'Workspace',
              //'AdministrativeStatusContainer', 'AdministrativeStatus',
              //'DocumentRoute', 'Favorites', 'RouteNode',
              //'DocumentRouteModelsRoot', 'ManagementRoot', 'SectionRoot', 'TaskRoot', 'TemplateRoot', 'UserWorkspacesRoot', 'WorkspaceRoot'
            ]
          };

          /**
           * Excludes some media type from search query
           * @param mediaTypes, Array of excluded mediaTypes
           * @returns {*}
           */
          this.excludeMedia = function (mediaTypes) {
            options.excludeMediaTypes = mediaTypes;
            return this;
          };

          this.withMedia = function (mediaTypes) {
            options.mediaTypes = mediaTypes;
            return this;
          };

          this.getPart = function () {
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
              incl = _(incl).reduce(function (result, val, key) {
                if (val) {
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
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMixin', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryMixin');

      this.$get = [function () {
        return function (options) {

          this.defaultOptions = {
            excludeMixinTypes: [
              'Folderish',
              'HiddenInNavigation'
            ]
          };

          /**
           * Excludes some document facets from search query
           * @param mixin, Array of excluded mixin
           * @returns {*}
           */
          this.excludeMixin = function (mixin) {
            options.excludeMixinTypes = mixin;
            return this;
          };

          this.withMixin = function (mixin) {
            options.mixin = mixin;
            return this;
          };

          this.getPart = function () {
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
              incl = _(incl).reduce(function (result, val, key) {
                if (val) {
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
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryNature', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryNature');

      this.$get = [function () {
        return function (options) {

          this.withNature = function (nature) {
            if (nature && nature.properties) {
              options.natureId = nature.properties.id;
            }
            return this;
          };

          this.getPart = function () {
            var natureId = options.natureId;
            if (angular.isString(natureId)) {
              return natureId.length ? ' AND (dc:nature = \'' + natureId + '\')' : '';
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPaginate', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryPaginate');

      this.$get = [function () {
        return function (options) {

          this.order = 99;

          this.paginate = function (size, index) {
            options.size = size;
            options.index = index;
            return this;
          };

          this.getPart = function () {
            if (angular.isDefined(options.size) && angular.isDefined(options.index)) {
              return '&pageSize=' + options.size + '&currentPageIndex=' + options.index;
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPath', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryPath');

      function pathQuery(val) {
        return '(ecm:path STARTSWITH \'' + val + '\')';
      }

      this.$get = ['nuxeoUserPromise', function (nuxeoUserPromise) {
        return function (options) {

          function addPath(path, negate) {
            if (!angular.isString(path)) {
              throw 'Path should be a String';
            }
            if (angular.isUndefined(options.paths)) {
              options.paths = [];
            }
            options.paths.push({value: path, negate: negate});
          }

          /**
           * Documents have to be placed in target path
           * @param path
           * @returns {*}
           */
          this.inPath = function (path) {
            addPath(path);
            return this;
          };

          /**
           * Documents have to be placed in user's personal workspace
           * @returns {*}
           */
          this.inUserWorkspace = function () {
            options.isUserDependent = true;
            nuxeoUserPromise.then(function (user) {
              addPath('/default-domain/UserWorkspaces/' + user.pathId);
            });
            return this;
          };

          /**
           * Documents are not in any user's personal workspace
           * @returns {*}
           */
          this.notInUserWorkspace = function () {
            addPath('/default-domain/UserWorkspaces/', true);
            return this;
          };

          this.getPart = function () {
            if (angular.isArray(options.paths)) {
              var terms = _(options.paths).reduce(function (result, path) {
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
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySorter', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQuerySorter');

      this.$get = [function () {
        return function (options) {

          this.order = 100;

          this.sortBy = function (properties, orders) {
            if (angular.isArray(properties)) {
              options.sortBy = properties;
              if (angular.isArray(orders) && orders.length) {
                options.sortOrder = [orders];
              } else {
                options.sortOrder = [];
                properties.forEach(function () {
                  options.sortOrder.push('ASC');
                });
              }
            } else if (angular.isObject(properties)) {
              options.sortBy = [];
              options.sortOrder = [];
              Object.keys(properties).forEach(function (key) {
                options.sortBy.push(key);
                options.sortOrder.push(properties[key]);
              });
            } else if (angular.isString(properties)) {
              options.sortBy = [properties];
              if (angular.isString(orders) && orders.length) {
                options.sortOrder = [orders];
              } else {
                options.sortOrder = ['ASC'];
              }
            } else {
              throw 'Should sort using an Array or String property';
            }
            return this;
          };

          this.getPart = function () {
            if (angular.isDefined(options.sortBy)) {
              return '&sortBy=' + options.sortBy.join(',') + '&sortOrder=' + options.sortOrder.join(',') + '';
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryState', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryState');

      this.$get = [function () {
        return function (options) {

          this.defaultOptions = {excludeDeleted: true};

          this.excludeDeleted = function () {
            options.excludeDeleted = true;
            return this;
          };

          this.includeDeleted = function () {
            options.excludeDeleted = false;
            return this;
          };

          this.getPart = function () {
            if (options.excludeDeleted) {
              return ' AND ecm:currentLifeCycleState <> \'deleted\'';
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQuerySubject', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQuerySubject');

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
        return function (options) {

          this.withSubject = function (subject) {
            if (subject && subject.properties) {
              options.subjectId = subject.properties.id;
            }
            return this;
          };

          this.getPart = function () {
            var subjectId = options.subjectId;
            if (angular.isString(subjectId)) {
              return subjectId.length ? ' AND (dc:subjects STARTSWITH \'' + map(subjectId) + '\')' : '';
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryTerm', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryTerm');

      function termsQuery(val) {
        return '(dc:title like \'%' + val + '%\')';
      }

      this.$get = [function () {
        return function (options) {

          this.withTerms = function (terms) {
            options.terms = terms;
            return this;
          };

          this.getPart = function () {
            if (angular.isArray(options.terms)) {
              var terms = _(options.terms).reduce(function (memo, val) {
                if (val.length) {
                  memo += (memo.length ? ' OR ' : '' ) + termsQuery(val);
                }
                return memo;
              }, '');
              return terms.length ? ' AND (' + terms + ')' : '';
            } else if (angular.isString(options.terms) && options.terms.length) {
              return ' AND ' + termsQuery(options.terms);
            }
            return '';
          };
        };
      }];

    }]);
angular.module('ngNuxeoQuery')

/**
 * @see https://doc.nuxeo.com/display/NXDOC/Query+Endpoint
 * @see https://doc.nuxeo.com/display/NXDOC/NXQL
 */
  .provider('NuxeoQuery', [
    function () {

      var queryParts = [];

      this.addQueryPartProvider = function (queryPart) {
        queryParts.push(queryPart);
      };

      this.$get = ['NuxeoQueryFactory', function (NuxeoQueryFactory) {
        return new NuxeoQueryFactory(queryParts);
      }];

    }]);
angular.module('ngNuxeoClient')

  .service('nuxeo', ['Document', 'Folder', 'Section', 'Workspace', 'NuxeoQuery', 'NuxeoDirectory', 'NuxeoTag',
    function (Document, Folder, Section, Workspace, NuxeoQuery, NuxeoDirectory, NuxeoTag) {

      this.Document = Document;

      this.Folder = Folder;

      this.Section = Section;

      this.Workspace = Workspace;

      this.Query = NuxeoQuery;

      this.continents = NuxeoDirectory.continents;

      this.countries = NuxeoDirectory.countries;

      this.natures = NuxeoDirectory.natures;

      this.subjects = NuxeoDirectory.subjects;

      this.tags = NuxeoTag;
    }]);
angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['Query',
    function (Query) {

      var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.get = function (searchChars, successCallback) {
        return new Query(tagQuery).$get(successCallback);
      };
    }]);
angular.module('ngNuxeoClient')

  .service('nuxeoUrl', ['nuxeoConstants',
    function (cst) {

      var apiBase = cst.nuxeo.baseURL + cst.nuxeo.apiPath, automationBase = cst.nuxeo.baseURL + cst.nuxeo.automationPath;

      this.automate = automationBase;

      this.request = apiBase + '/directory/:object';

      this.query = apiBase + '/query?query=:query';

      this.user = apiBase + '/user/:userName';
    }]);}( window ));