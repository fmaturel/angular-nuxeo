angular.module('ngNuxeoClient')

  .service('nuxeo', ['$injector', 'Document', 'Folder', 'Section', 'Workspace', 'NuxeoDirectory', 'NuxeoTag',
    function ($injector, Document, Folder, Section, Workspace, NuxeoDirectory, NuxeoTag) {

      /**
       * All basic nuxeo services are registered here
       */
      angular.extend(this, {
        Document: Document,
        Folder: Folder,
        Section: Section,
        Workspace: Workspace,
        continents: NuxeoDirectory.continents,
        countries: NuxeoDirectory.countries,
        natures: NuxeoDirectory.natures,
        subjects: NuxeoDirectory.subjects,
        tags: NuxeoTag
      });

      this.register = function (service) {
        if (angular.isFunction(service)) {
          if (service.name && !this.hasOwnProperty(service.name)) {
            this[service.name] = $injector.get(service.name);
          } else {
            throw 'Nuxeo service registration failed for service [' + service + ']';
          }
        }
      };
    }]);