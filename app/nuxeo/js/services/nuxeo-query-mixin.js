angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMixin', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryMixin');

      this.$get = ['nuxeoUtils', function (utils) {
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

        // Don't provide default behaviour
        // QueryPart.defaultOptions = { excludeMixinTypes: ['Folderish', 'HiddenInNavigation'] };

        QueryPart.getPart = function (options) {
          // Exclusion
          var criterias = '';

          var excl = options.excludeMixinTypes;
          if (angular.isArray(excl) && excl.length) {
            criterias += ' AND ecm:mixinType NOT IN (\'' + excl.join('\',\'') + '\')';
          } else if (angular.isString(excl) && excl.length) {
            criterias += ' AND ecm:mixinType <> \'' + excl + '\'';
          }

          // Inclusion : Transform if Object => Array
          var incl = utils.objToArray(options.mixin);
          if (angular.isArray(incl) && incl.length) {
            criterias += ' AND ecm:mixinType IN (\'' + incl.join('\',\'') + '\')';
          } else if (angular.isString(incl) && incl.length) {
            criterias += ' AND ecm:mixinType = \'' + incl + '\'';
          }

          return criterias;
        };

        return QueryPart;
      }];

    }]);
