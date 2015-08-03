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
    path: '/nuxeo',
    nuxeo: {
      baseURL: 'http://demo.nuxeo.local/nuxeo',
      apiPath: '/site/api/v1',
      automationPath: '/site/api/v1/automation',
      timeout: 5 // Timeout in seconds
    }
  });

angular.module('ngNuxeoSecurity')

  .factory('BasicAuthInterceptor', [
    function () {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y';
          return config;
        }
      };
    }]);
angular.module('ngNuxeoClient')

  .service('nuxeoClient', ['$resource', 'nuxeoUrl', 'nuxeoConstants',
    function ($resource, url, cst) {

      var File = $resource(url.nuxeo.file, {}, {
        get: {
          method: 'POST',
          headers: {
            'X-NXVoidOperation': 'false',
            'Nuxeo-Transaction-Timeout': cst.nuxeo.timeout
          },
          responseType: 'arraybuffer',
          transformResponse: function (data, headers) {
            return {
              blob: new Blob([data], {
                type: headers('content-type')
              })
            };
          }
        }
      });

      var Query = $resource(url.nuxeo.query, {}, {
        get: {
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
          }
        }
      });

      return {
        File: File,

        Query: Query,

        request: function (path) {
          return $resource(url.nuxeo.request + '/' + path);
        }
      };
    }]);
angular.module('ngNuxeoClient')

  .service('NuxeoDirectory', ['nuxeoClient', '$log',
    function (nuxeoClient, $log) {

      this.continents = nuxeoClient.request('directory/continent');

      this.countries = nuxeoClient.request('directory/country');

      this.natures = nuxeoClient.request('directory/nature');

      this.subjects = nuxeoClient.request('directory/subject');

    }]);
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
angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryCoverage', ['NuxeoQueryProvider',
    function (NuxeoQueryProvider) {

      NuxeoQueryProvider.addQueryPartProvider('NuxeoQueryCoverage');

      this.$get = [function () {
        return function (options) {

          this.withCoverage = function (coverage) {
            if (coverage  && coverage.properties) {
              if(coverage.directoryName === 'continent') {
                options.continentId = coverage.properties.id;
              } else if(coverage.directoryName === 'country') {
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

      this.$get = [ '$filter', function ($filter) {
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

  .factory('NuxeoQueryFactory', ['$injector',
    function ($injector) {

      var baseQuery = 'SELECT * FROM Document WHERE 1=1';

      return function (client, queryPartFactoryName, $log) {

        var QueryBuilder = function () {

          var options = {}, partBuilders = [];

          // Enrich with query providers
          angular.forEach(queryPartFactoryName, function (factoryName) {
            var Part = $injector.get(factoryName);
            var part = new Part(options);

            angular.extend(this, new Part(options));
            if (angular.isObject(part.defaultOptions)) {
              angular.extend(options, part.defaultOptions);
            }
            if (angular.isFunction(part.getPart)) {
              partBuilders.push({order: part.order || 0, getPart: part.getPart});
            }
          }, this);

          // Sort services by defined order
          partBuilders = _.sortBy(partBuilders, 'order').map(function (o) {
            return o.getPart;
          });

          //********************************** PUBLIC METHODS
          this.get = function (successCallback, errorCallback) {
            var query = baseQuery;// + getPath() + getNotDeleted() + getNotExpired() + getTerms() + getMedia() + getPagination();

            angular.forEach(partBuilders, function (builder) {
              query += builder(options);
            });

            $log.debug('Nuxeo query built by NuxeoQuery Service: ' + query);
            return client.Query.get({query: query}, successCallback, errorCallback);
          };
        };

        return QueryBuilder;
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

      this.$get = [function () {
        return function (options) {

          this.onPath = function (path) {
            options.path = path;
            return this;
          };

          this.getPart = function () {
            if (angular.isArray(options.path)) {
              var terms = _(options.path).reduce(function (memo, val) {
                if (val.length) {
                  memo += (memo.length ? ' OR ' : '' ) + pathQuery(val);
                }
                return memo;
              }, '');
              return terms.length ? ' AND (' + terms + ')' : '';
            } else if (angular.isString(options.path) && options.path.length) {
              return ' AND ' + pathQuery(options.path);
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

      this.$get = ['NuxeoQueryFactory', 'nuxeoClient', '$log', function (NuxeoQueryFactory, nuxeoClient, $log) {
        return new NuxeoQueryFactory(nuxeoClient, queryParts, $log);
      }];

    }]);
angular.module('ngNuxeoClient')

  .service('nuxeo', ['NuxeoDirectory', 'NuxeoFile', 'NuxeoQuery', 'NuxeoTag',
    function (NuxeoDirectory, NuxeoFile, NuxeoQuery, NuxeoTag) {

      this.continents = NuxeoDirectory.continents;

      this.countries = NuxeoDirectory.countries;

      this.natures = NuxeoDirectory.natures;

      this.subjects = NuxeoDirectory.subjects;

      this.File = NuxeoFile;

      this.Query = NuxeoQuery;

      this.tags = NuxeoTag;
    }]);
angular.module('ngNuxeoClient')

  .service('NuxeoTag', ['nuxeoClient', '$log',
    function (nuxeoClient, $log) {

      var tagQuery = 'SELECT * FROM Document WHERE ecm:primaryType = \'Tag\'';

      this.get = function (searchChars, successCallback) {
        return nuxeoClient.Query.get({query: tagQuery}, successCallback);
      };
    }]);
angular.module('ngNuxeoClient')

  .service('nuxeoUrl', ['nuxeoConstants',
    function (cst) {

      var apiBase = cst.nuxeo.baseURL + cst.nuxeo.apiPath;

      var automationBase = cst.nuxeo.baseURL + cst.nuxeo.automationPath;

      this.nuxeo = {
        automate: automationBase,
        file: automationBase + '/Document.GetBlob',
        query: apiBase + '/query?query=:query',
        request: apiBase
      };
    }]);}( window ));