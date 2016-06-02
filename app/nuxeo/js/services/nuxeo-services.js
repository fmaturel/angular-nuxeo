angular.module('ngNuxeoClient')

  .service('nuxeo', ['$injector', 'Automation', 'Document', 'Folder', 'Section', 'Workspace', 'NuxeoDirectory', 'NuxeoTag',
    function ($injector, Automation, Document, Folder, Section, Workspace, NuxeoDirectory, NuxeoTag) {

      /**
       * All basic nuxeo services are registered here
       */
      angular.extend(this, {
        Automation: Automation,
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

      this.register = function (service, name) {
        if (angular.isFunction(service) && name && !this.hasOwnProperty(name)) {
          this[name] = $injector.get(name);
        } else {
          throw 'Nuxeo service registration failed for service [' + service + ']';
        }
      };
      
      this.upload = function (fileInputElement, successCallback, errorCallback) {
        var file = fileInputElement.files[0], reader = new FileReader();
        reader.onloadend = function () {
          var document = new Document({
            type: 'Picture',
            name: file.name,
            properties: {'dc:title': file.name}
          });
          document.upload(file, successCallback, errorCallback);
        };
        reader.readAsBinaryString(file);
      };
    }]);