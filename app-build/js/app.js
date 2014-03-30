(function() {
  'use strict';

  angular.module('scDashboard', ['ngRoute', 'scDashboard.controllers']).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html',
          controller: 'scdHomeCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });

    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scDashboard.controllers', ['scecUser.services']).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scecCurrentUserApi',
    function($scope, $location, currentUserApi) {

      $scope.activeUser = null;
      currentUserApi.get('/').then(function(info) {
        $scope.activeUser = info;
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