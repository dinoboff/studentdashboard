(function() {
  'use strict';

  angular.module('scDashboard', ['ngRoute', 'scDashboard.controllers', 'scdRepository.controllers']).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/scdashboard/repository.html',
          controller: 'scdRepositoryListCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });

    }
  ])

  ;

})();