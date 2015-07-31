(function (window, undefined) {
  'use strict';

  String.prototype.ignoreUnsignificantChars = function () {
    return this.trim().replace(/<!--[^>]*>/g, '').replace(/[\r\n]/g, '').replace(/>\s+</g, '><');
  };
})(window, undefined);
