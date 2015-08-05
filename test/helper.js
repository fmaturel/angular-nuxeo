(function (window, undefined) {
  'use strict';

  String.prototype.ignoreUnsignificantChars = function () {
    return this.trim().replace(/<!--[^>]*>/g, '').replace(/[\r\n]/g, '').replace(/>\s+</g, '><');
  };

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }
})(window, undefined);
