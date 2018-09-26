angular.module('ngNuxeoQueryPart')

  .provider('NuxeoQueryProxy', ['QueryProvider',
    function (QueryProvider) {

      QueryProvider.addQueryPartProvider('NuxeoQueryProxy');

      this.$get = [function () {
        var QueryPart = function () {
          /**
           * Documents must be proxy (A proxy is very much like a symbolic link on an Unix-like OS)
           * A proxy points to a documentwill look like a document from the user point of view:
           * - The proxy will have the same metadata as the target document,
           * - The proxy will hold the same files as the target documents (since file is a special kind of metadata).
           * @see https://doc.nuxeo.com/nxdoc/repository-concepts/#proxies
           * @returns {QueryPart}
           */
          this.isProxy = function () {
            this.options.isProxy = true;
            return this;
          };
          /**
           * Documents is not a proxy
           * @returns {QueryPart}
           */
          this.isNotProxy = function () {
            this.options.isNotProxy = true;
            return this;
          };
        };

        // Don't provide default behaviour
        QueryPart.defaultOptions = {isNotProxy: true};

        QueryPart.getPart = function (options) {
          if (options.isProxy) {
            return 'ecm:isProxy = 1';
          }
          if (options.isNotProxy) {
            return 'ecm:isProxy = 0';
          }
          return '';
        };

        return QueryPart;
      }];
    }]);
