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
    '$q',
    'scdRepositoryApi',
    'initialData',
    function ScdRepositoryListCtrl($q, scdRepositoryApi, initialData) {
      var self = this;
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
    }
  ]).

  controller('ScdRepositoryUploadFileCtrl', [
    '$upload',
    'scdRepositoryApi',
    function ScdRepositoryUploadFileCtrl($upload, scdRepositoryApi) {
      var self = this;

      this.docTypes = ['SHELF', 'USMLE', 'Peer Evaluations'];
      this.selected = {};

      function onProgress(evt) {
        self.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function onSucess(data) {
        self.files.unshift(data);
        self.success = 'New file uploaded.';
        self.selected.file = null;
        self.reset();
      }

      function uploadFile(file) {
        scdRepositoryApi.newUploadUrl(self.selector.selected.studentId).then(function(uploadInfo) {
          self.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: self.fileMeta.name || file.name,
              docType: self.fileMeta.docType,
              destId: self.selector.selected.studentId
            },
            file: file
          }).progress(
            onProgress
          ).success(
            onSucess
          );
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

      this.uploadButtonClicked = function(file) {
        uploadFile(file);
        this.showProgress = true;
      };

      this.reset();
    }
  ])

  ;

})();
