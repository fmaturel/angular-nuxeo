angular.module('ngNuxeoClient')

  .service('nuxeoUtils', [function () {

    return {

      /**
       * Inherit
       */
      inherit: function inherit(NewType, ParentType) {

        if (!angular.isFunction(NewType) || !angular.isFunction(ParentType)) {
          throw 'New type and parent type in hierarchy should be Function';
        }

        // Inherit
        NewType.prototype = new ParentType();
        NewType.prototype.constructor = NewType;

        // Static methods
        angular.extend(NewType, ParentType);

        // Add a super static method
        NewType.super = ParentType;

        return NewType;
      }
    };
  }]);