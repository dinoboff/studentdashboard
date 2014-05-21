(function() {
  'use strict';

  angular.module('scdMisc.filters', []).

  filter('fullName', function() {
    return function(obj) {
      return obj.firstName + ' ' + obj.lastName;
    };
  })


  ;

})();