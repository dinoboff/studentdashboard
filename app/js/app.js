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