describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser, dataUser, dataWorkspace;

  beforeEach(module('ngNuxeoClient', 'data/user.json', 'data/workspace.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataUser_, _dataWorkspace_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataUser = _dataUser_;
    dataWorkspace = _dataWorkspace_;
  }));

  describe('nuxeoFolder object', function () {

    it('is valid when instantiated', function () {

      expect(nuxeo.Folder.name === 'Folder').toBe(true);

      var folder = new nuxeo.Folder();

      expect(typeof folder === 'object').toBe(true);
      expect(folder instanceof nuxeo.Folder).toBe(true);
      expect(folder.constructor === nuxeo.Folder).toBe(true);
      expect(folder.defaultPath === '/default-domain/workspaces').toBe(true);

      expect(folder.isDeletable).toBeFalsy();
      expect(folder.isPublishable).toBeFalsy();
    });
  });

  describe('nuxeo service', function () {

    it('should create a Section when requested', function () {
      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenGET('http://demo.nuxeo.com/nuxeo/api/v1/query?query=' +
        'SELECT+*+FROM+Document+WHERE+ecm:path+%3D%22%2Fdefault-domain%2FUserWorkspaces%2Ffmaturel-github-com%22'
      ).respond(dataWorkspace);

      httpBackend.whenPOST('http://demo.nuxeo.com/nuxeo/site/automation/Document.Create').respond('{\"type": \"Section\"}');

      nuxeo.Section.create({name: 'newFolder'}, '/default-domain/workspaces', function (result) {
        expect(result).toBeDefined();
        expect(result.type).toEqual('Section');
      });

      nuxeoUser.login('Administrator', 'Administrator');

      httpBackend.flush();
    });
  });

  describe('nuxeo.Section object', function () {

    it('is valid when instantiated', function () {
      var section = new nuxeo.Section();

      expect(typeof section === 'object').toBe(true);
      expect(section instanceof nuxeo.Section).toBe(true);
      expect(section.constructor === nuxeo.Section).toBe(true);
      expect(section.type === 'Section').toBe(true);
      expect(section.defaultPath).toEqual('/default-domain/sections');
    });
  });

  describe('nuxeo.Workspace object', function () {

    it('is valid when instantiated', function () {
      var workspace = new nuxeo.Workspace();

      expect(typeof workspace === 'object').toBe(true);
      expect(workspace instanceof nuxeo.Workspace).toBe(true);
      expect(workspace.constructor === nuxeo.Workspace).toBe(true);
      expect(workspace.defaultPath).toEqual('/default-domain/workspaces');
    });
  });
});
