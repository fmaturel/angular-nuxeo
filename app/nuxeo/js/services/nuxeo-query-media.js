angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMedia', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryMedia');

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