(function() {
  'use strict';

  angular.module('scDashboard', [
    'ngRoute',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdReview.controllers'
  ]).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.

        when('/', {
          templateUrl: 'views/scdashboard/repository.html',
          controller: 'scdRepositoryListCtrl'
        }).

        when('/review', {
          templateUrl: 'views/scdashboard/review.html',
          controller: 'scdReviewCtrl'
        }).

        otherwise({
          redirectTo: '/'
        });

    }
  ])

  ;

})();