(function() {
  'use strict';

  angular.module('scDashboard', [
    'ngRoute',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdFirstAid.controllers',
    'scdPortfolio.controllers',
    'scdReview.controllers',
    'scdPortFolio.directives',
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
          controller: 'scdReviewCtrl',
          controllerAs: 'ctrl'
        }).

        when('/first-aid', {
          templateUrl: 'views/scdashboard/first-aid.html',
          controller: 'scdFirstAidCtrl'
        }).

        when('/assessments', {
          templateUrl: 'views/scdashboard/portfolio.html',
          controller: 'scdPortfolioCtrl',
          controllerAs: 'ctrl'
        }).

        when('/portfolio/:studentId/exam/:examId', {
          templateUrl: 'views/scdashboard/exam.html',
          controller: 'scdPfExamCtrl',
          controllerAs: 'ctrl'
        }).

        when('/portfolio/:studentId/evaluation/:evaluationId', {
          templateUrl: 'views/scdashboard/evaluation.html',
          controller: 'scdPfEvaluationCtrl',
          controllerAs: 'ctrl'
        }).

        otherwise({
          redirectTo: '/'
        });

    }
  ])

  ;

})();