(function() {
  'use strict';

  angular.module('scdFirstAid.controllers', [
    'scceSvg.services',
    'scceUser.services',
    'scDashboard.services',
    'scdMisc.services',
    'scdSelector.services'
  ]).

  /**
   * Use to resolve `initialData` of `scdFirstAidStatsCtrl`.
   *
   */
  factory('scdFirstAidStatsCtrlInitialData', [
    '$q',
    'scceUsersApi',
    'scdDashboardApi',
    'scdSelectedStudent',
    function scdFirstAidStatsCtrlInitialDataFactory($q, scceUsersApi, scdDashboardApi, scdSelectedStudent) {
      return function scdFirstAidStatsCtrlInitialData() {
        var params = {
            limit: 30,
            residents: 'all',
            topic: 'all',
            sortBy: 'predictiveSum'
          },
          selectorPromise = scdSelectedStudent(),
          studentsPromise = selectorPromise.then(function(selector) {
            // If the selector is not available, the current user cannot
            // see the stats either
            if (!selector.available) {
              return $q.reject('Only staff or admins can access this page.');
            }

            return scdDashboardApi.firstAid.listStats(params);
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

            topics: scdDashboardApi.firstAid.listTopics().then(function(topics) {
              return [{
                id: 'all',
                label: 'All Categories'
              }].concat(topics);
            }),

            sortBy: [{
              id: 'predictiveSum',
              label: 'Sum of Predictions',
            }, {
              id: 'predictiveAverage',
              label: 'Average of Predictions'
            }],

          })
        });
      };
    }
  ]).

  /**
   * scdFirstAidStatsCtrl
   *
   */
  controller('ScdFirstAidStatsCtrl', [
    '$window',
    '$location',
    'ScceLayout',
    'ScdPageCache',
    'scdDashboardApi',
    'initialData',
    function ScdFirstAidStatsCtrl($window, $location, ScceLayout, ScdPageCache, scdDashboardApi, initialData) {
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

        if (sortBy.id === 'performance') {
          return {
            x: {
              label: sortBy.label + ' (%)',
              unit: '%'
            }
          };
        } else {
          return {
            x: {
              label: sortBy.label,
              unit: ''
            }
          };
        }
      }

      this.pages = new ScdPageCache(initialData.params.limit);
      this.pages.add(initialData.students);
      this.filters = initialData.params;
      this.filterOptions = initialData.paramOptions;

      this.chartRef = null; // no average stats yet.
      this.chartLegend = setLegend(this.filters.sortBy);
      this.chartOptions = {
        domain: function(series) {
          var max, min;
          if (self.filters.sortBy === 'performance') {
            return [0, 100];
          } else {
            max = _.max(series, function(s) {
              return s[self.filters.sortBy];
            });
            min = _.min(series, function(s) {
              return s[self.filters.sortBy];
            });
            return _.map([min, max], self.filters.sortBy);
          }
        },
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
          scdDashboardApi.firstAid.listStats(params).then(function(students) {
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

        self.chartLegend = setLegend(params.sortBy);
        scdDashboardApi.firstAid.listStats(params).then(function(students) {
          self.pages.add(students);
          setStudent(self.pages.next());
        });
      };

      this.showDetails = function(studentStats) {
        initialData.selector.select({
          studentId: studentStats.studentId
        });
        $location.path('/first-aid');
      };
    }
  ]).

  /**
   * Use to resolve `initialData` of `ScdFirstAidUserStatsCtrl`.
   *
   */
  factory('scdFirstAidUserStatsCtrlInitialData', [
    '$window',
    '$q',
    'scdSelectedStudent',
    'scdDashboardApi',
    function scdFirstAidUserStatsCtrlInitialDataFactory($window, $q, scdSelectedStudent, scdDashboardApi) {
      return function scdFirstAidUserStatsCtrlInitialData() {
        var _ = $window._,
          selectorPromise = scdSelectedStudent(),
          params = {
            ref: 'programAverage'
          };

        return $q.all({
          topics: scdDashboardApi.firstAid.listTopics().then(function(topics) {
            return _.reduce(topics, function(map, topic) {
              map[topic.id] = topic;
              return map;
            }, {});
          }),
          params: params,
          selector: selectorPromise,
          userStats: selectorPromise.then(function(selector) {
            if (!selector.selected || !selector.selected.studentId) {
              return null;
            }

            return scdDashboardApi.firstAid.getStats(selector.selected.studentId, params).catch(function() {
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
   * ScdFirstAidUserStatsCtrl
   *
   */
  controller('ScdFirstAidUserStatsCtrl', [
    '$window',
    'ScceLayout',
    'scdDashboardApi',
    'initialData',
    function ScdFirstAidUserStatsCtrl($window, ScceLayout, scdDashboardApi, initialData) {
      var self = this,
        _ = $window._;

      this.selector = initialData.selector;
      this.userStats = initialData.userStats;
      this.filters = initialData.params;
      this.filterOptions = initialData.filterOptions;

      this.cummulativePerf = {
        layout: ScceLayout.contentSizing({
          innerWidth: 500,
          innerHeight: 200,
          margin: {
            top: 20,
            right: 150,
            bottom: 30,
            left: 70
          },
        }),
        options: {
          domain: [-300, 300],
          unit: '',
          getValue: function(day) {
            return day.predictiveSum;
          }
        }
      };

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
          domain: function(series) {
            var max, min;

            max = _.max(series, function(s) {
              return s.predictiveSum;
            });
            min = _.min(series, function(s) {
              return s.predictiveSum;
            });

            return _.map([min, max], 'predictiveSum');
          },
          getLabel: function(row) {
            return initialData.topics[row.id].label;
          },
          hasRef: function() {
            return false;
          },
          getRef: function() {
            return null;
          },
          getUnit: function() {
            return '';
          },
          getValue: function(row) {
            return row.predictiveSum;
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
        return scdDashboardApi.firstAid.getStats(studentId).then(function(stats) {
          self.userStats = stats;
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
