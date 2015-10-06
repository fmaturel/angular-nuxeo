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