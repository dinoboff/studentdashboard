(function() {
  'use strict';

  angular.module('scDashboard.controllers', ['scecUser.services']).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scecCurrentUserApi',
    function($scope, $location, currentUserApi) {

      $scope.activeUser = null;
      $scope.login = currentUserApi.get('/').then(function(info) {
        $scope.activeUser = info;
        return info;
      });

      $scope.isActive = function(route) {
        return route === $location.path();
      };
    }
  ]).

  controller('scdHomeCtrl', ['$scope',
    function($scope) {
      $scope.files = {};
    }
  ])

  ;

})();