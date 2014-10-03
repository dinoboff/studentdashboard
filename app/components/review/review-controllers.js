(function() {
  'use strict';

  angular.module('scdReview.controllers', [
    'scceSvg.services',
    'scceUser.services',
    'scDashboard.services',
    'scdMisc.filters',
    'scdMisc.services',
    'scdSelector.services'
  ]).

  /**
   * `scdReviewStatsCtrlInitialData`
   *
   * Resolve `initialData` for `ScdReviewStatsCtrl`.
   *
   */
  factory('scdReviewStatsCtrlInitialData', [
    '$q',
    'scceUsersApi',
    'scdDashboardApi',
    'scdSelectedStudent',
    function scdReviewStatsCtrlInitialDataFactory($q, scceUsersApi, scdDashboardApi, scdSelectedStudent) {
      return function scdReviewStatsCtrlInitialData() {
        var params = {
            limit: 30,
            residents: 'all',
            topic: 'all',
            sortBy: 'performance'
          },
          selectorPromise = scdSelectedStudent(),
          studentsPromise = selectorPromise.then(function(selector) {
            // If the selector is not available, the current user cannot
            // see the stats either
            if (!selector.available) {
              return $q.reject('Only staff or admins can access this page.');
            }

            return scdDashboardApi.review.listStats(params);
          });


        return $q.all({
          selector: selectorPromise,
          params: params,
          students: studentsPromise,
          paramOptions: $q.all({

            residents: scceUsersApi.listPgys().then(function(years) {
              return [{
                id: 'all',
                label: 'All Students',
              }].concat(years);
            }),

            topics: scdDashboardApi.review.listTopics().then(function(topics) {
              return [{
                id: 'all',
                label: 'All Categories'
              }].concat(topics);
            }),

            sortBy: [{
              id: 'performance',
              label: 'Performance',
            }, {
              id: 'percentageComplete',
              label: 'Percentage Complete'
            }]

          })
        });
      };
    }
  ]).

  controller('ScdReviewStatsCtrl', [
    '$location',
    '$window',
    'ScceLayout',
    'scdDashboardApi',
    'ScdPageCache',
    'initialData',
    function ScdReviewStatsCtrl($location, $window, ScceLayout, scdDashboardApi, ScdPageCache, initialData) {
      var self = this,
        _ = $window._,
        rowHeight = 25;

      function setStudent(students) {
        self.students = students;
        self.chartLayout = ScceLayout.contentSizing({
          innerWidth: 600,
          innerHeight: rowHeight * students.length,
          margin: {
            top: 20,
            right: 200,
            bottom: 50,
            left: 200
          }
        });
      }

      function setLegend(sortById) {
        var sortBy = _.find(
          self.filterOptions.sortBy, {
            id: sortById
          }
        );
        return {
          x: {
            label: sortBy.label + ' (%)',
            unit: '%'
          }
        };
      }

      this.pages = new ScdPageCache(initialData.params.limit);
      this.pages.add(initialData.students);
      this.filters = initialData.params;
      this.filterOptions = initialData.paramOptions;

      this.chartRef = null; // no average stats yet.
      this.chartLegend = setLegend(this.filters.sortBy);
      this.chartOptions = {
        getLabel: function(row) {
          return row.displayName;
        },
        getValue: function(row) {
          return row[self.filters.sortBy];
        }
      };

      setStudent(this.pages.next());

      /**
       * Query next page of student
       *
       */
      this.next = function(params) {
        params = _.clone(params);

        if (
          this.pages.cursor &&
          this.pages.remaining() < this.pages.viewSize
        ) {
          params.cursor = this.pages.cursor;
          scdDashboardApi.review.listStats(params).then(function(students) {
            self.pages.add(students);
            setStudent(self.pages.next());
          });
        } else {
          setStudent(this.pages.next());
        }
      };

      /**
       * Query previous page of student
       *
       */
      this.prev = function() {
        if (this.pages.position() > 0) {
          setStudent(this.pages.prev());
        }
      };

      /**
       * To be called after the parameter have been changed.
       *
       * It should query the student list with new parameters.
       *
       */
      this.filterChanged = function(params) {
        this.pages.clear();

        if (params.topic !== 'all') {
          params.sortBy = 'performance';
        }

        self.chartLegend = setLegend(params.sortBy);
        scdDashboardApi.review.listStats(params).then(function(students) {
          self.pages.add(students);
          setStudent(self.pages.next());
        });
      };

      this.showDetails = function(studentStats) {
        initialData.selector.select({
          studentId: studentStats.studentId
        });
        $location.path('/review');
      };
    }
  ]).

  /**
   * Use to resolve `initialData` of `ScdReviewUserStatsCtrl`.
   *
   */
  factory('scdReviewUserStatsCtrlInitialData', [
    '$q',
    'scdSelectedStudent',
    'scdDashboardApi',
    function scdReviewUserStatsCtrlInitialDataFactory($q, scdSelectedStudent, scdDashboardApi) {
      return function scdReviewUserStatsCtrlInitialData() {
        var selectorPromise = scdSelectedStudent(),
          params = {
            ref: 'programAverage'
          };

        return $q.all({
          params: params,
          selector: selectorPromise,
          userStats: selectorPromise.then(function(selector) {
            if (!selector.selected || !selector.selected.studentId) {
              return null;
            }

            return scdDashboardApi.review.getStats(selector.selected.studentId, params).catch(function() {
              return null;
            });
          }),
          filterOptions: $q.all({
            refs: [{
              id: 'programAverage',
              label: 'Program Average'
            }]
          })
        });
      };
    }
  ]).

  /**
   * ScdReviewUserStatsCtrl
   *
   */
  controller('ScdReviewUserStatsCtrl', [
    '$window',
    'ScceLayout',
    'scdDashboardApi',
    'initialData',
    function ScdReviewUserStatsCtrl($window, ScceLayout, scdDashboardApi, initialData) {
      var self = this,
        _ = $window._;

      this.selector = initialData.selector;
      this.userStats = initialData.userStats;
      this.filters = initialData.params;
      this.filterOptions = initialData.filterOptions;

      this.cummulativePerf = {
        layout: ScceLayout.contentSizing({
          innerWidth: 400,
          innerHeight: 360,
          margin: {
            top: 20,
            right: 150,
            bottom: 30,
            left: 70
          },
        }),
        options: {
          getValue: function(day) {
            return day.performance;
          }
        }
      };

      function components(userStats) {
        var correct, left;
        if (!userStats) {
          return;
        }

        correct = userStats.performance * userStats.percentageComplete / 100;
        left = 100 - userStats.percentageComplete;

        return [{
          label: 'Correct',
          value: correct,
          id: 'correct'
        }, {
          label: 'Incorrect',
          value: 100 - correct - left,
          id: 'incorrect'
        }, {
          label: 'Unattempted',
          value: left,
          id: 'unattempted'
        }].filter(function(c) {
          return c.value > 0;
        });
      }

      function categoriesLayout(stats, baseLayout) {
        if (!stats || !stats.categoryPerformances) {
          return;
        }

        return new ScceLayout.contentSizing(_.assign({
            'innerHeight': stats.categoryPerformances.length * baseLayout.rowHeight
          },
          baseLayout
        ));
      }

      this.progress = {
        layout: ScceLayout.contentSizing({
          innerWidth: 300,
          innerHeight: 149,
          margin: {
            top: 30,
            right: 50,
            bottom: 110,
            left: 50
          },
        }),
        components: components(this.userStats)
      };

      this.passing = {
        layout: ScceLayout.contentSizing({
          innerWidth: 100,
          innerHeight: 50,
          margin: {
            top: 12,
            right: 12,
            bottom: 50,
            left: 12
          },
        }),
        steps: [{
          min: 0,
          max: 75,
          id: 'danger'
        }, {
          max: 90,
          id: 'warning'
        }, {
          max: 100,
          id: 'ok'
        }]
      };

      this.abem = {
        layout: this.passing.layout,
        steps: [{
          min: 0,
          max: 75,
          id: 'danger'
        }, {
          max: 100,
          id: 'ok'
        }]

      };

      this.byCategory = {
        layout: null,
        baseLayout: {
          rowHeight: 27,
          innerWidth: 500,
          margin: {
            top: 10,
            right: 60,
            bottom: 50,
            left: 220
          },
        },

        options: {
          getLabel: function(row) {
            return row.label;
          },
          hasRef: function() {
            return false;
          },
          getRef: function() {
            return null;
          },
          getUnit: function() {
            return '%';
          },
          getValue: function(row) {
            return row.performance;
          },
        }
      };
      this.byCategory.layout = categoriesLayout(
        this.userStats,
        this.byCategory.baseLayout
      );



      this.showStats = function(studentId) {
        if (!studentId) {
          this.userStats = null;
          return;
        }

        self.userStats = null;
        return scdDashboardApi.review.getStats(studentId).then(function(stats) {
          self.userStats = stats;
          self.progress.components = components(stats);
          self.byCategory.layout = categoriesLayout(
            self.userStats,
            self.byCategory.baseLayout
          );
        });
      };
    }
  ])

  ;

})();
