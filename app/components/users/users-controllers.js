(function() {
  'use strict';

  angular.module('scdUsers.controllers', [
    'scDashboard.services'
  ]).

  /**
   * Use to resolve `initialData` of `ScdUserListCtrl`.
   *
   */
  factory('scdUserListCtrlInitialData', [
    '$q',
    'scdDashboardApi',
    function scdUserListCtrlInitialDataFactory($q, scdDashboardApi) {
      return function scdUserListCtrlInitialData() {

        return $q.all({
          users: scdDashboardApi.users.listUsers()
        });
      };
    }
  ]).

  /**
   * ScdUserListCtrl
   *
   */
  controller('ScdUserListCtrl', [
    '$window',
    '$q',
    'scdDashboardApi',
    'initialData',
    function ScdUserListCtrl($window, $q, scdDashboardApi, initialData) {
      var self = this,
        _ = $window._;

      this.users = initialData.users;

      this.getMore = function() {
        if (!this.users || !this.users.cursor) {
          return $q.when([]);
        }

        this.loading = $q.when(this.loading).then(function() {
          return scdDashboardApi.users.listUsers(self.users.cursor);
        }).then(function(users) {
          self.users = self.users.concat(users);
          self.users.cursor = users.cursor;
          return users;
        }).finally(function(){
          self.loading = null;
        });

        return this.loading;
      };

      this.switchStaff = function(user, input) {
        var promise, originalValue = user.isStaff;

        input.disabled = true;
        if (user.isStaff) {
          promise = scdDashboardApi.users.revokeStaff(user);
        } else {
          promise = scdDashboardApi.users.makeStaff(user);
        }

        return promise.then(function() {
          user.isStaff = !originalValue;
        }).catch(function() {
          user.isStaff = originalValue;
          input.$setViewValue(originalValue);
        }).finally(function() {
          input.disabled = false;
        });
      };

      this.switchAdmin = function(user, input) {
        var promise, originalValue = user.isAdmin;

        input.disabled = true;
        if (user.isAdmin) {
          promise = scdDashboardApi.users.revokeAdmin(user);
        } else {
          promise = scdDashboardApi.users.makeAdmin(user);
        }

        return promise.then(function() {
          user.isAdmin = !originalValue;
        }).catch(function() {
          user.isAdmin = originalValue;
          input.$setViewValue(originalValue);
        }).finally(function() {
          input.disabled = false;
        });
      };

      this.deleteUser = function(user) {
        scdDashboardApi.users.deleteUser(user.id).then(function() {
          _.remove(self.users, {
            id: user.id
          });
        });
      };
    }
  ]);

})();
