describe('ngNuxeoClient module', function () {
  'use strict';

  var httpBackend, nuxeo, nuxeoUser, dataUser;

  beforeEach(module('ngNuxeoClient', 'data/user.json'));

  beforeEach(inject(function ($httpBackend, _nuxeo_, _nuxeoUser_, _dataUser_) {
    httpBackend = $httpBackend;
    nuxeo = _nuxeo_;
    nuxeoUser = _nuxeoUser_;
    dataUser = _dataUser_;
  }));

  describe('nuxeoFolder object', function () {

    it('is valid when instantiated', function () {

      expect(nuxeo.Folder.name === 'Folder').toBe(true);

      var folder = new nuxeo.Folder();

      expect(typeof folder === 'object').toBe(true);
      expect(folder instanceof nuxeo.Folder).toBe(true);
      expect(folder.constructor === nuxeo.Folder).toBe(true);
      expect(folder.path === '/default-domain/workspaces').toBe(true);

      expect(folder.upload).toBeUndefined();
    });
  });

  describe('nuxeo service', function () {

    it('should create a Section when requested', function () {
      httpBackend.whenGET('http://demo.nuxeo.local/nuxeo/site/api/v1/user/Administrator').respond(dataUser);

      httpBackend.whenPOST('http://demo.nuxeo.local/nuxeo/site/automation/Document.Create').respond('{}');

      nuxeo.Folder.create({name: 'newFolder'}, '/default-domain/workspaces', function (result) {
        expect(result).toBeDefined();
        expect(result.status).toEqual(200);
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
      expect(section.path === '/default-domain/sections').toBe(true);

      expect(section.upload).toBeUndefined();
    });
  });

  describe('nuxeo.Workspace object', function () {

    it('is valid when instantiated', function () {
      var workspace = new nuxeo.Workspace();

      expect(typeof workspace === 'object').toBe(true);
      expect(workspace instanceof nuxeo.Workspace).toBe(true);
      expect(workspace.constructor === nuxeo.Workspace).toBe(true);
      expect(workspace.path === '/default-domain/workspaces').toBe(true);

      expect(workspace.upload).toBeUndefined();
    });
  });
});