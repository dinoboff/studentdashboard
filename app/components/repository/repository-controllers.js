(function() {
  'use strict';

  angular.module('scdRepository.controllers', [
    'angularFileUpload',
    'scceUser.services',
    'scDashboard.services',
    'scdRepository.directives',
    'scdRepository.services',
    'scdSelector.services'
  ]).

  factory('scdRepositoryListCtrlInitialData', [
    '$q',
    'scdSelectedStudent',
    'scdRepositoryApi',
    function scdRepositoryListCtrlInitialDataFactory($q, scdSelectedStudent, scdRepositoryApi) {
      return function scdRepositoryListCtrlInitialData() {
        var selectorPromise = scdSelectedStudent();

        return $q.all({
          selector: selectorPromise,
          files: selectorPromise.then(function(selector) {
            if (!selector.selected || !selector.selected.studentId) {
              return [];
            }
            return scdRepositoryApi.getRepositoryById(selector.selected.studentId);
          })
        });
      };
    }
  ]).

  controller('ScdRepositoryListCtrl', [
    '$window',
    '$q',
    'scdRepositoryApi',
    'initialData',
    function ScdRepositoryListCtrl($window, $q, scdRepositoryApi, initialData) {
      var self = this,
        _ = $window._;

      this.files = initialData.files;
      this.selector = initialData.selector;


      this.listFile = function(studentId) {
        if (!studentId) {
          this.files = [];
          return $q.reject('You need to select a student.');
        }

        this.files = null;
        return scdRepositoryApi.getRepositoryById(studentId).then(function(list) {
          self.files = list;
          return list;
        }).catch(function(resp) {
          self.files = [];
          if (resp.status === 401) {
            self.error = 'You need to be logged to list a repository';
          } else if (resp.status === 403) {
            self.error = 'Only admin or staff can list the files of a student.';
          } else {
            self.error = 'Unexpected error while trying to fetch the file list';
          }
        });
      };

      this.delete = function(file) {
        scdRepositoryApi.deleteDocument(file).then(function() {
          _.remove(self.files, {id: file.id});
        });
      };
    }
  ]).

  controller('ScdRepositoryUploadFileCtrl', [
    '$q',
    '$upload',
    'scdRepositoryApi',
    function ScdRepositoryUploadFileCtrl($q, $upload, scdRepositoryApi) {
      var self = this;

      this.docTypes = ['SHELF', 'USMLE', 'Peer Evaluations'];
      this.selected = {};

      function onProgress(evt) {
        self.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function onSucess(data, fileList) {
        fileList.unshift(data);
        self.success = 'New file uploaded.';
        self.selected.file = null;
        self.reset();
      }

      function uploadFile(student, file, fileList) {
        if (!student || !student.studentId) {
          return $q.reject('No student selected');
        }

        scdRepositoryApi.newUploadUrl(student.studentId).then(function(uploadInfo) {
          self.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: self.fileMeta.name || file.name,
              docType: self.fileMeta.docType,
              destId: student.studentId
            },
            file: file
          }).progress(
            onProgress
          ).success(function(data) {
            onSucess(data, fileList);
          });
        });

      }

      this.reset = function() {
        this.fileMeta = {};
        this.selected.file = null;
        this.showProgress = false;
        this.progress = 0;
      };

      this.onFileSelect = function(file) {
        this.fileMeta.name = file.name;
      };

      this.uploadButtonClicked = function(student, file, fileList) {
        uploadFile(student, file, fileList);
        this.showProgress = true;
      };

      this.reset();
    }
  ])

  ;

})();
