(function() {
  'use strict';

  angular.module('scdRepository.controllers', ['scdRepository.services', 'scecStudents.services', 'scecUser.services']).

  controller('scdRepositoryList', ['$scope', 'scdRepositoryApi', 'scecStudentsApi', 'scecCurrentUserApi',
    function($scope, scdRepositoryApi, scecStudentsApi, scecCurrentUserApi) {

      scecCurrentUserApi.get().then(function(user) {
        if (user.error) {
          $scope.error = 'You need to be logged to list a repository';
          $scope.files = [];
          return;
        }
        if (!user.isStaff && !user.isAdmin) {
          return $scope.listFile(user.id);
        }

        $scope.displayStudentsSelect = true;
        listStudent();
        $scope.files = [];
        return $scope.files;
      });


      $scope.students = null;
      $scope.displayStudentsSelect = false;
      function listStudent() {
        return scecStudentsApi.all().then(function(studentList) {
          $scope.students = studentList;
        });
      }

      $scope.files = null;
      $scope.listFile = function(studentId) {
        $scope.files = null;
        scdRepositoryApi.getRepositoryById(studentId).then(function(list) {
          $scope.files = list;
        }).catch(function(resp) {
          if (resp.status === 401) {
            $scope.error = 'You need to be logged to list a repository';
          } else if (resp.status === 403) {
            $scope.error = 'Only admin or staff can list the files of a student.';
          } else {
            $scope.error = 'Unexpected error while trying to fetch the file list';
          }
        });
      };
    }
  ])

  ;

})();