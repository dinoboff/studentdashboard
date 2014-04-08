(function() {
  'use strict';

  angular.module(
    'scdRepository.controllers', [
      'scdRepository.services',
      'scceStudents.services',
      'scceUser.services',
      'scDashboard.services',
      'angularFileUpload',
      'scdRepository.directives'
    ]
  ).

  controller('scdRepositoryListCtrl', ['$scope', 'scdRepositoryApi', 'scceStudentsApi', 'scceCurrentUserApi', '$q',
    function($scope, scdRepositoryApi, scceStudentsApi, scceCurrentUserApi, $q) {
      $scope.currentUser = null;
      $scope.files = null;
      $scope.showStudentSelector = false;
      $scope.selected = {};
      $scope.students = null;

      scceCurrentUserApi.auth().then(function(user) {
        if (user.error) {
          $scope.error = 'You need to be logged to list a repository';
          $scope.files = [];
          return $q.reject('You need to be logged to list a repository');
        }

        $scope.currentUser = user;
        if (!user.staffId && !user.isAdmin) {
          $scope.listFile(user.id);
          return user;
        }

        $scope.showStudentSelector = true;
        $scope.files = [];
        listStudent();
        return user;
      });

      function listStudent() {
        return scceStudentsApi.all().then(function(studentList) {
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
      $scope.docTypes = ['SHELF', 'USMLE', 'Peer Evaluations'];

      function onProgress(evt) {
        $scope.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function onSucess(data) {
        $scope.files.unshift(data);
        $scope.success = 'New file uploaded.';
        $scope.selected.file = null;
        $scope.reset();
      }

      function uploadFile(file) {
        scdRepositoryApi.newUploadUrl($scope.selected.student.id).then(function(uploadInfo) {
          $scope.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: $scope.fileMeta.name || file.name,
              docType: $scope.fileMeta.docType,
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
        $scope.selected.file = null;
        $scope.showProgress = false;
        $scope.progress = 0;
      };

      $scope.onFileSelect = function(file) {
        $scope.fileMeta.name = file.name;
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