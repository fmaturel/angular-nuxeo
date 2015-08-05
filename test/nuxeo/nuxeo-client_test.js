describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo,
    dataUser, dataDirectory, dataDocuments;

  beforeEach(module('ngNuxeoClient', 'data/user.json', 'data/directory.json', 'data/documents.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _dataUser_, _dataDirectory_, _dataDocuments_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    dataUser = _dataUser_;
    dataDirectory = _dataDirectory_;
    dataDocuments = _dataDocuments_;
  }));

  describe('nuxeo service', function () {

    it('should fetch directories when requested', function () {
      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/directory/continent').respond(dataDirectory);
      nuxeo.continents.get(function (result) {
        expect(result).toBeDefined();
        expect(result.entries).toBeDefined();
        expect(result.entries).toEqual(dataDirectory.entries);
      });
      httpBackend.flush();
    });

    it('should query nuxeo server in right path when requested', inject(function ($filter) {
      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/query' +
        '?query=SELECT%20*%20FROM%20Document%20WHERE%201=1%20AND%20(dc:expired%20IS%20NULL%20OR%20dc:expired%20%3E=%20DATE%20\'' +
        $filter('date')(new Date(), 'yyyy-MM-dd') + '\')%20' +
        'AND%20ecm:primaryType%20NOT%20IN%20(\'Favorites\')%20AND%20ecm:mixinType%20NOT%20IN%20(\'Folderish\',\'HiddenInNavigation\')%20' +
        'AND%20((ecm:path%20STARTSWITH%20\'%2F\'))%20AND%20ecm:currentLifeCycleState%20%3C%3E%20\'deleted\'')
        .respond(dataDocuments);
      new nuxeo.Query()
        .inPath('/')
        .get(function (result) {
          expect(result).toBeDefined();
          expect(result.entries).toBeDefined();
          expect(result.entries.length).toEqual(2);
        });
      httpBackend.flush();
    }));

    it('should query nuxeo server in user path when requested', inject(function ($filter) {
      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/query' +
        '?query=SELECT%20*%20FROM%20Document%20WHERE%201=1%20AND%20(dc:expired%20IS%20NULL%20OR%20dc:expired%20%3E=%20DATE%20\'' +
        $filter('date')(new Date(), 'yyyy-MM-dd') + '\')%20' +
        'AND%20ecm:primaryType%20NOT%20IN%20(\'Favorites\')%20AND%20ecm:mixinType%20NOT%20IN%20(\'Folderish\',\'HiddenInNavigation\')%20' +
        'AND%20((ecm:path%20STARTSWITH%20\'%2Fdefault-domain%2FUserWorkspaces%2Ffmaturel-github-com\'))%20AND%20ecm:currentLifeCycleState%20%3C%3E%20\'deleted\'')
        .respond(dataDocuments);
      new nuxeo.Query()
        .inUserWorkspace()
        .get(function (result) {
          expect(result).toBeDefined();
          expect(result.entries).toBeDefined();
          expect(result.entries.length).toEqual(2);
        });
      httpBackend.flush();
    }));
  });


});