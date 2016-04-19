angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMedia', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryMedia');

      this.$get = ['nuxeoUtils', function (utils) {
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
          // Rather use mixin exclusion = 'Folderish' and 'HiddenInNavigation'
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
          var incl = utils.objToArray(options.mediaTypes);
          if (angular.isArray(incl) && incl.length) {
            criterias += ' AND ecm:primaryType IN (\'' + incl.join('\',\'') + '\')';
          } else if (angular.isString(incl) && incl.length) {
            criterias += ' AND ecm:primaryType = \'' + incl + '\'';
          }

          return criterias;
        };

        return QueryPart;
      }];

    }]);