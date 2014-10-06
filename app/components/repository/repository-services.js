(function() {
  'use strict';

  angular.module('scdRepository.services', ['scDashboard.services']).

  factory('scdRepositoryApi', ['scdDashboardBaseApi',
    function(scdDashboardBaseApi) {
      return {
        getRepositoryById: function(studentId) {
          return scdDashboardBaseApi.one('repository', studentId).all('files').getList();
        },
        newUploadUrl: function(studentId) {
          return scdDashboardBaseApi.one('repository', studentId).one('uploadurl').post();
        },
        deleteDocument: function(doc) {
          return scdDashboardBaseApi.one('repository', doc.destId).one('files', doc.id).remove();
        }
      };
    }
  ])

  ;

})();
