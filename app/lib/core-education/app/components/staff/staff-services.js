(function() {
  'use strict';


  angular.module('scceStaff.services', ['scCoreEducation.services']).

  factory('scceStaffApi', ['scceUsersApi',
    function(scceUsersApi) {
      return {
        all: function() {
          console.log('Deprecated... Use scceUsersApi.students() instead');
          return scceUsersApi.students();
        },
        add: function(userId) {
          console.log(
            'Deprecated... Use scceUsersApi.makeStaff({id:userID}) instead'
          );
          return scceUsersApi.makeStaff({
            id: userId
          });
        }
      };
    }
  ])

  ;

})();