(function() {
  'use strict';

  angular.module(
    'scdRepository.controllers', [
      'scdRepository.services',
      'scecStudents.services',
      'scDashboard.services',
      'angularFileUpload'
    ]
  ).

  controller('scdRepositoryListCtrl', ['$scope', 'scdRepositoryApi', 'scecStudentsApi', 'scdDashboardUserApi', '$q',
    function($scope, scdRepositoryApi, scecStudentsApi, scdDashboardUserApi, $q) {
      $scope.currentUser = null;
      $scope.files = null;
      $scope.showStudentSelector = false;
      $scope.selected = {};
      $scope.students = null;

      scdDashboardUserApi.get().then(function(user) {
        if (user.error) {
          $scope.error = 'You need to be logged to list a repository';
          $scope.files = [];
          return $q.reject('You need to be logged to list a repository');
        }

        $scope.currentUser = user;
        if (!user.isStaff && !user.isAdmin) {
          $scope.listFile(user.id);
          return user;
        }

        $scope.showStudentSelector = true;
        $scope.files = [];
        listStudent();
        return user;
      });

      function listStudent() {
        return scecStudentsApi.all().then(function(studentList) {
          $scope.students = studentList;
        });
      }

      $scope.listFile = function(studentId) {
        if (!studentId) {
          $scope.files = [];
          return $q.reject('You need to select a student.');
        }

        $scope.files = null;
        return scdRepositoryApi.getRepositoryById(studentId).then(function(list) {
          $scope.files = list;
          return list;
        }).catch (function(resp) {
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
  ]).

  controller('scdRepositoryUploadFileCtrl', ['$scope', '$upload', 'scdRepositoryApi',
    function($scope,$upload, scdRepositoryApi) {

      function onProgress(evt) {
        $scope.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function onSucess(data) {
        $scope.files.unshift(data);
        $scope.success = 'New file uploaded.';
        $scope.reset();
      }

      function uploadFile(file) {
        scdRepositoryApi.newUploadUrl($scope.selected.student.id).then(function(uploadInfo) {
          $scope.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: $scope.fileMeta.name,
              destId: $scope.selected.student.id
            },
            file: file
          }).progress(
            onProgress
          ).success(
            onSucess
          );
        });
      }

      $scope.reset = function() {
        $scope.fileMeta = {};
        $scope.showProgress = false;
        $scope.progress = 0;
      };

      $scope.onFileSelect = function(files) {
        $scope.fileMeta.name = files[0].name;
        $scope.selected.file = files[0];
      };

      $scope.uploadButtonClicked = function(file) {
        uploadFile(file);
        $scope.showProgress = true;
      };

      $scope.reset();
    }
  ])

  ;

})();