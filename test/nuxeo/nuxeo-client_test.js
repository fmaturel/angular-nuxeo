describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser,
    dataUser, dataDirectory, dataDocuments;

  beforeEach(module('ngNuxeoClient', 'data/user.json', 'data/directory.json', 'data/documents.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataUser_, _dataDirectory_, _dataDocuments_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataUser = _dataUser_;
    dataDirectory = _dataDirectory_;
    dataDocuments = _dataDocuments_;
  }));

  describe('nuxeo service', function () {

    it('should fetch directories when requested', function () {
      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/directory/continent').respond(dataDirectory);

      nuxeo.continents.get(function (result) {
        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        expect(result.entries).toEqual(dataDirectory.entries);
      });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    });

    it('should query nuxeo server in right path when requested', inject(function ($filter) {
      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/query' +
        '?query=SELECT+*+FROM+Document+WHERE+1%3D1+AND+(dc:expired+IS+NULL+OR+dc:expired+%3E%3D+DATE+\'' +
        $filter('date')(new Date(), 'yyyy-MM-dd') + '\')+' +
        'AND+ecm:primaryType+NOT+IN+(\'Favorites\')+AND+ecm:mixinType+NOT+IN+(\'HiddenInNavigation\')+' +
        'AND+((ecm:path+STARTSWITH+\'%2F\'))+AND+ecm:currentLifeCycleState+%3C%3E+\'deleted\'')
        .respond(dataDocuments);

      nuxeo.Document.query()
        .inPath('/')
        .$get(function (result) {
          expect(result).toBeDefined();
          expect(result.entries).toBeDefined();
          expect(result.entries.length).toEqual(2);
        });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    }));

    it('should query nuxeo server in user path when requested', inject(function ($filter) {
      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/user/Administrator').respond(dataUser);

      var request = 'http://demo.nuxeo.com/nuxeo/api/v1/query' +
        '?query=SELECT+*+FROM+Document+WHERE+1%3D1+AND+(dc:expired+IS+NULL+OR+dc:expired+%3E%3D+DATE+\'' +
        $filter('date')(new Date(), 'yyyy-MM-dd') + '\')+' +
        'AND+ecm:primaryType+NOT+IN+(\'Favorites\')+AND+ecm:mixinType+NOT+IN+(\'HiddenInNavigation\')+' +
        'AND+((ecm:path+STARTSWITH+\'%2Fdefault-domain%2FUserWorkspaces%2Ffmaturel-github-com\'))+AND+ecm:currentLifeCycleState+%3C%3E+\'deleted\'';

      httpBackend.whenGET(request).respond(dataDocuments);

      nuxeo.Document.query()
        .inUserWorkspace()
        .$get(function (result) {
          expect(result).toBeDefined();
          expect(result.entries).toBeDefined();
          expect(result.entries.length).toEqual(2);
        });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    }));
  });


});