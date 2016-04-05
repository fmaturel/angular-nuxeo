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