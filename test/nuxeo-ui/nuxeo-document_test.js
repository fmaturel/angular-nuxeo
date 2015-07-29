'use strict';

describe('ngNuxeoUI module', function () {

  var $compile, $scope, $templateCache;

  beforeEach(
    module(
      'ngNuxeoUI',
      'data/entry-picture.json', 'data/entry-audio.json',
      'expected/nuxeo-picture.html', 'expected/nuxeo-audio.html'
    )
  );

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $templateCache = _$templateCache_;
  }));

  describe('nuxeoDocument directive', function () {

    it("should display an image when entry is a Picture", function () {

      inject(function (_dataEntryPicture_) {
        $scope.entry = _dataEntryPicture_;
      });

      var expectedPicture = $templateCache.get('expected/nuxeo-picture.html');

      // Compile a piece of HTML containing the directive
      var element = $compile("<nuxeo-document></nuxeo-document>")($scope);
      // fire all the watches
      $scope.$digest();

      expect(element.html().ignoreUnsignificantChars()).toEqual(expectedPicture.ignoreUnsignificantChars());
    });

    it("should display audio when entry is a Audio", function () {
      inject(function (_dataEntryAudio_) {
        $scope.entry = _dataEntryAudio_;
      });

      var expectedAudio = $templateCache.get('expected/nuxeo-audio.html');

      // Compile a piece of HTML containing the directive
      var element = $compile("<nuxeo-document></nuxeo-document>")($scope);
      // fire all the watches
      $scope.$digest();

      expect(element.html().ignoreUnsignificantChars()).toEqual(expectedAudio.ignoreUnsignificantChars());
    });
  });
});