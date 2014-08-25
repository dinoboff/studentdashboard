(function() {
  'use strict';

  angular.module('scdPortFolio.services', ['scDashboard.services']).

  /**
   * Deprecated.
   *
   */
  factory('scdPorfolioApi', ['scdDashboardBaseApi',
    function(dashboardBaseApi) {
      return {
        getById: function(userId) {
          return dashboardBaseApi.all('portfolio').get(userId);
        },

        getExamById: function(userId, examId) {
          return dashboardBaseApi.one(
            'portfolio', userId
          ).all('exam').get(examId);
        },

        getEvaluationById: function(userId, evaluationId) {
          return dashboardBaseApi.one(
            'portfolio', userId
          ).all('evaluation').get(evaluationId);
        }
      };
    }
  ]).

  factory('scdPfSvgLayout', [

    function() {
      return function(margin, width, height) {
        margin = margin || {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        };
        width = width || 600;
        height = height || 450;

        return {
          margin: margin,
          width: width,
          height: height,
          innerWidth: width - margin.right - margin.left,
          innerHeight: height - margin.top - margin.bottom
        };

      };
    }
  ])

  ;

})();