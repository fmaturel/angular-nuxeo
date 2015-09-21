angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryMixin', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryMixin');

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
        };
      }];

    }]);