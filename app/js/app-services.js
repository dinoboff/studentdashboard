(function() {
  'use strict';


  angular.module('scDashboard.services', ['restangular', 'scDashboard.config', 'scceUser.services']).

  factory('scdDashboardBaseApi', ['$window', 'Restangular', 'SCD_API_BASE',
    function scdDashboardBaseApiFactory($window, Restangular, SCD_API_BASE) {
      var _ = $window._,
        interceptor = function(data, operation, what) {
          var resp;

          if (operation !== 'getList') {
            return data;
          }

          if (angular.isArray(resp)) {
            data.cursor = null;
            return data;
          }

          if (data[what]) {
            resp = data[what];
            _.assign(resp, _.omit(data, [what]));
          } else if (data.type && data[data.type]) {
            resp = data[data.type];
            _.assign(resp, _.omit(data, [data.type]));
          } else {
            resp = [];
          }

          resp.cursor = data.cursor ? data.cursor : null;
          return resp;
        };

      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(SCD_API_BASE);
        RestangularConfigurer.addResponseInterceptor(interceptor);
        RestangularConfigurer.setDefaultHeaders({
          'X-App-Name': 'dashboard'
        });
      });
    }
  ]).

  factory('scdDashboardApi', [
    'scdDashboardBaseApi',
    function scdDashboardApiFactory(scdDashboardBaseApi) {
      var api = scdDashboardBaseApi;

      return {
        /**
         * Repository resources
         *
         * TODO: move api client here.
         *
         */
        repository: {},

        /**
         * Assessment endpoint
         *
         */
        assessments: {

          /**
           * List all exams with their stats. Can get filtered to show
           * the exams a user took part of.
           *
           */
          listExams: function(userId) {
            var params = {};

            if (userId) {
              params.userId = userId;
            }
            return api.all('assessments').all('exams').getList(params);
          },

          /**
           * Return detailed results of an exam
           *
           */
          getExamById: function(examId) {
            return api.all('assessments').one('exams', examId).get();
          },

          /**
           * Get an upload url for a new result to upload.
           */
          newUploadUrl: function() {
            return api.all('assessments').all('uploadurl').post();
          }
        },

        /**
         * Rosh Review endpoints
         */
        review: {

          /**
           * Fetch Student Rosh Review ranks
           *
           */
          listStats: function(params) {
            return api.all('roshreview').all('stats').getList(params);
          },

          /**
           * Fetch detailled stats of a student
           */
          getStats: function(studentId) {
            return api.all('roshreview').one('stats', studentId).get();
          },

          /**
           * Fetch the list of of Rosh Review topics
           */
          listTopics: function() {
            return api.all('roshreview').all('topic').getList();
          }

        },

        /**
         * First Aid endpoints
         */
        firstAid: {

          /**
           * Fetch Student Rosh Review ranks
           *
           */
          listStats: function(params) {
            return api.all('firstaid').all('stats').getList(params);
          },

          /**
           * Fetch detailled stats of a student
           */
          getStats: function(studentId) {
            return api.all('firstaid').one('stats', studentId).get();
          },

          /**
           * Fetch the list of of Rosh Review topics
           */
          listTopics: function() {
            return api.all('firstaid').all('topics').getList();
          }

        }
      };
    }
  ])

  ;

})();
