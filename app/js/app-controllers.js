(function() {
  'use strict';

  angular.module('scDashboard.controllers', ['scDashboard.services', 'scceUser.directives']).

  controller('scdNavBarCtrl', ['$scope', '$location',
    function($scope, $location) {
      $scope.isActive = function(route) {
        return route === $location.path();
      };
    }
  ]).

  controller('scdHomeCtrl', ['$scope',

  ])

  ;

})();