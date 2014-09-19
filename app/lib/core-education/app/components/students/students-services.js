(function() {
  'use strict';


  angular.module('scceStudents.services', ['scCoreEducation.services']).

  factory('scceStudentsApi', ['scceUsersApi',
    function(scceUsersApi) {
      return {
        all: function() {
          console.log('Deprecated... Use scceUsersApi.students() instead');
          return scceUsersApi.students();
        }
      };
    }
  ])

  ;

})();