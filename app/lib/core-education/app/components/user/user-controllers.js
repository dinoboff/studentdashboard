(function() {
  'use strict';

  angular.module('scceUser.controllers', []).

  controller('ScceUserListCtrl', ['$q', 'scceUsersApi', 'getList', 'initialList', 'userType',
    function($q, scceUsersApi, getList, initialList, userType) {
      var self = this;

      this.users = initialList;
      this.userType = userType;
      this.loading = null;

      this.updateUserList = function() {
        this.loading = $q.when(this.loading).then(function(){
          return getList();
        }).then(function(users){
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

        this.loading = $q.when(this.loading).then(function(){
          return getList(this.users.cursor);
        }).then(function(users){
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
    }
  ])


  ;

})();