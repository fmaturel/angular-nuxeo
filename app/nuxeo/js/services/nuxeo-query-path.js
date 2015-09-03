angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryPath', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryPath');

      function pathQuery(val) {
        return '(ecm:path STARTSWITH \'' + val + '\')';
      }

      this.$get = [function () {
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
           * Documents have to be placed in default type path
           * @returns {*}
           */
          this.inDefaultPath = function () {
            addPath(this.DocumentConstructor.prototype.defaultPath);
            return this;
          };

          /**
           * Documents have to be placed in user's personal workspace
           * @returns {*}
           */
          this.inUserWorkspace = function () {
            options.isInUserWorkspace = true;
            return this;
          };

          /**
           * Documents are not in any user's personal workspace
           * @returns {*}
           */
          this.notInUserWorkspace = function () {
            options.notInUserWorkspace = true;
            return this;
          };

          this.getPart = function (user) {

            if (options.isInUserWorkspace) {
              addPath('/default-domain/UserWorkspaces/' + user.pathId);
              if (options.notInUserWorkspace) {
                throw 'InUserWorkspace and notInUserWorkspace both present, watch your query options!';
              }
            }
            if (options.notInUserWorkspace) {
              addPath('/default-domain/UserWorkspaces/', true);
            }

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