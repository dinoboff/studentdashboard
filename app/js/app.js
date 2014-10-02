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

  /**
   * Return a promise resolving to the current user if he's part of staff.
   *
   * Can be used as in route resolve map.
   *
   */
  function currentUserIsStaff(scceCurrentUserApi, $window, $q) {
    return scceCurrentUserApi.auth().then(function(user) {
      if (!user.isLoggedIn && user.loginUrl) {
        $window.location.replace(user.loginUrl);
        return user;
      }

      if (!user.isStaff && !user.isAdmin) {
        return $q.reject('Only staff or admins can access this page.');
      }
      return user;
    });
  }
  currentUser.$inject = ['scceCurrentUserApi', '$window', '$q'];


  angular.module('scDashboard', [
    'ngRoute',
    'angular-loading-bar',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdFirstAid.controllers',
    'scdPortfolio.controllers',
    'scdReview.controllers',
    'scdPortFolio.directives',
    'scdMisc.filters',
    'scdChart.directives',
    // Load core education angular app, which configure the router
    // https://github.com/ChrisBoesch/core-education/blob/master/app/js/app.js
    // It will add routes for `/users`, `/students` and `/users`.
    'scCoreEducation',
    'scceUser.services'
  ]).

  config(['$routeProvider', 'cfpLoadingBarProvider', 'scceUserOptionsProvider',
    function($routeProvider, cfpLoadingBarProvider, scceUserOptionsProvider) {

      scceUserOptionsProvider.setAppName('dashboard');
      cfpLoadingBarProvider.includeSpinner = false;

      $routeProvider.

      when('/', {
        templateUrl: 'views/scdashboard/repository.html',
        controller: 'ScdRepositoryListCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser,
          'initialData': ['scdRepositoryListCtrlInitialData',
            function(scdRepositoryListCtrlInitialData) {
              return scdRepositoryListCtrlInitialData();
            }
          ]
        }
      }).

      when('/review', {
        templateUrl: 'views/scdashboard/review-user.html',
        controller: 'ScdReviewUserStatsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser,
          'initialData': ['scdReviewUserStatsCtrlInitialData',
            function(scdReviewUserStatsCtrlInitialData) {
              return scdReviewUserStatsCtrlInitialData();
            }
          ]
        }
      }).

      when('/review/stats', {
        templateUrl: 'views/scdashboard/review-stats.html',
        controller: 'ScdReviewStatsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUserIsStaff,
          'initialData': ['scdReviewStatsCtrlInitialData',
            function(scdReviewStatsCtrlInitialData) {
              return scdReviewStatsCtrlInitialData();
            }
          ]
        }
      }).

      when('/first-aid/stats', {
        templateUrl: 'views/scdashboard/firstaid-stats.html',
        controller: 'ScdFirstAidStatsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUserIsStaff,
          'initialData': ['scdFirstAidStatsCtrlInitialData',
            function(scdFirstAidStatsCtrlInitialData) {
              return scdFirstAidStatsCtrlInitialData();
            }
          ]
        }
      }).

      when('/assessments', {
        templateUrl: 'views/scdashboard/portfolio.html',
        controller: 'ScdPortfolioCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser,
          'initialData': ['scdPortfolioCtrlInitialData',
            function(scdPortfolioCtrlInitialData) {
              return scdPortfolioCtrlInitialData();
            }
          ]
        }
      }).

      when('/assessments/exam/:examId', {
        templateUrl: 'views/scdashboard/exam-stats.html',
        controller: 'ScdPortfolioExamStatsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUserIsStaff,
          'initialData': ['scdPortfolioExamStatsCtrlInitialData',
            function(scdPortfolioExamStatsCtrlInitialData) {
              return scdPortfolioExamStatsCtrlInitialData();
            }
          ]
        }
      }).

      when('/assessments/exam/:examId/user/:userId', {
        templateUrl: 'views/scdashboard/exam.html',
        controller: 'ScdPortfolioStudentExamCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': currentUser,
          'initialData': ['scdPortfolioStudentExamCtrlInitialData',
            function(scdPortfolioStudentExamCtrlInitialData) {
              return scdPortfolioStudentExamCtrlInitialData();
            }
          ]
        }
      }).

      otherwise({
        redirectTo: '/'
      });

    }
  ])

  ;

})();
