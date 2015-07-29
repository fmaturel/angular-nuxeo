'use strict';

describe('ngNuxeoDemoApp module', function () {

  var scope, createController;

  beforeEach(module('ngNuxeoDemoApp'));

  beforeEach(inject(function ($rootScope, $controller, nuxeo) {
    scope = $rootScope.$new();

    createController = function() {
      return $controller('DemoController', {
        '$scope': scope,
        'nuxeo': nuxeo
      });
    };
  }));

  describe('demo controller', function () {

    it('should be defined', inject(function () {
      //spec body
      var demoController = createController();
      expect(demoController).toBeDefined();
    }));

  });
});