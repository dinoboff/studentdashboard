(function() {
  'use strict';

  angular.module('scDashboard.controllers', [
    'scceUser.directives',
    'scceUser.services',
    'scDashboard.services'
  ]).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scceCurrentUserApi',
    function($scope, $location, currentUserApi) {
      $scope.currentUser = null;

      $scope.isActive = function(route) {
        return route === $location.path();
      };

      currentUserApi.auth().then(function(user) {
        $scope.currentUser = user;
      });
    }
  ])

  ;

})();