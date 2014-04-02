(function() {
  'use strict';

  angular.module('scDashboard.controllers', ['scDashboard.services']).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scdDashboardUserApi',
    function($scope, $location, userApi) {

      $scope.activeUser = null;
      $scope.login = userApi.get().then(function(info) {
        $scope.activeUser = info;
        return info;
      });

      $scope.isActive = function(route) {
        return route === $location.path();
      };
    }
  ]).

  controller('scdHomeCtrl', ['$scope',

  ])

  ;

})();