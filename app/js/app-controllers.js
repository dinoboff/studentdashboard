(function() {
  'use strict';

  angular.module('scDashboard.controllers', []).

  controller('scdNavBarCtrl', ['$scope', function($scope) {
    $scope.hideMenu = false;
    $scope.activeUser = {name: 'bob'};
    $scope.isActive = function() {
      return false;
    };
  }])

  ;

})();