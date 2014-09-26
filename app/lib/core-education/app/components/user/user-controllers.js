(function() {
  'use strict';

  angular.module('scceUser.controllers', []).

  controller('ScceUserListCtrl', ['$q', '$upload', 'scceUsersApi', 'getList', 'initialList', 'userType', 'currentUser',
    function($q, $upload, scceUsersApi, getList, initialList, userType, currentUser) {
      var self = this;

      this.currentUser = currentUser;
      this.users = initialList;
      this.userType = userType;
      this.loading = null;
      this.upload = {
        file: null,
        year: null,
        inProgress: false
      };

      this.updateUserList = function() {
        this.loading = $q.when(this.loading).then(function() {
          return getList();
        }).then(function(users) {
          self.users = users;
          self.loading = null;
          return users;
        });

        return this.loading;
      };

      this.getMore = function() {
        if (!this.users || !this.users.cursor) {
          return $q.when([]);
        }

        this.loading = $q.when(this.loading).then(function() {
          return getList(self.users.cursor);
        }).then(function(users) {
          self.users = self.users.concat(users);
          self.users.cursor = users.cursor;
          self.loading = null;
          return users;
        });

        return this.loading;
      };

      this.makeStaff = function(user) {
        user.isStaff = true;
        scceUsersApi.makeStaff(user).catch(function() {
          user.isStaff = false;
        });
      };

      this.revokeStaff = function(user) {
        // TODO
        console.dir(user);
      };

      this.fileSelected = function($files, info) {
        info.file = $files[0];
      };

      this.uploadFile = function(info) {
        this.inProgress = true;
        scceUsersApi.newStudentUploadUrl().then(function(url) {
          return $upload.upload({
            url: url,
            method: 'POST',
            withCredentials: true,
            data: {
              year: info.year
            },
            file: info.file
          });
        }).then(function() {
          info.file = null;
          info.year = null;
        }).finally(function() {
          info.inProgress = false;
        });
      };
    }
  ])


  ;

})();
