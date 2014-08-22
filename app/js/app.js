(function() {
  'use strict';

  /**
   * Return a promise resolving to the current user or redirect the user
   * if she/he is not logged in.
   *
   * Can be used as in route resolve map.
   *
   */
  function currentUser(scceCurrentUserApi, $window) {
    return scceCurrentUserApi.auth().then(function(user) {
      if (!user.isLoggedIn && user.loginUrl) {
        $window.location.replace(user.loginUrl);
      }
      return user;
    });
  }
  currentUser.$inject = ['scceCurrentUserApi', '$window'];


  angular.module('scDashboard', [
    'ngRoute',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdFirstAid.controllers',
    'scdPortfolio.controllers',
    'scdReview.controllers',
    'scdPortFolio.directives',
    'scdMisc.filters',
    // Load core education angular app, which configure the router
    // https://github.com/ChrisBoesch/core-education/blob/master/app/js/app.js
    // It will add routes for `/users`, `/students` and `/users`.
    'scCoreEducation',
    'scceUser.services'
  ]).

  config(['$routeProvider', 'scceUserOptionsProvider',
    function($routeProvider, scceUserOptionsProvider) {

      scceUserOptionsProvider.setAppName('dashboard');

      $routeProvider.

      when('/', {
        templateUrl: 'views/scdashboard/repository.html',
        controller: 'scdRepositoryListCtrl',
        resolve: {
          'currentUser': currentUser
        }
      }).

      when('/review', {
        templateUrl: 'views/scdashboard/review.html',
        controller: 'scdReviewCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser
        }

      }).

      when('/first-aid', {
        templateUrl: 'views/scdashboard/first-aid.html',
        controller: 'scdFirstAidCtrl',
        resolve: {
          'currentUser': currentUser
        }
      }).

      when('/assessments', {
        templateUrl: 'views/scdashboard/portfolio.html',
        controller: 'scdPortfolioCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser
        }
      }).

      when('/assessments/:studentId/exam/:examId', {
        templateUrl: 'views/scdashboard/exam.html',
        controller: 'scdPfExamCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser
        }
      }).

      when('/assessments/:studentId/evaluation/:evaluationId', {
        templateUrl: 'views/scdashboard/evaluation.html',
        controller: 'scdPfEvaluationCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser
        }
      }).

      otherwise({
        redirectTo: '/'
      });

    }
  ])

  ;

})();
