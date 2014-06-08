(function() {
  'use strict';

  angular.module('scDashboard', [
    'ngRoute',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdFirstAid.controllers',
    'scdReview.controllers',
    'scdMisc.filters'
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

        when('/first-aid', {
          templateUrl: 'views/scdashboard/first-aid.html',
          controller: 'scdFirstAidCtrl'
        }).

        otherwise({
          redirectTo: '/'
        });

    }
  ])

  ;

})();