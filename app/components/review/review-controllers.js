(function() {
  'use strict';

  function layout(opts) {
    opts = opts || {};
    opts.innerHeight = opts.innerHeight || 400;
    opts.innerWidth = opts.innerWidth || 300;
    opts.margin = opts.margin || {};
    opts.margin.top = opts.margin.top || 20;
    opts.margin.right = opts.margin.right || 20;
    opts.margin.bottom = opts.margin.bottom || 20;
    opts.margin.left = opts.margin.left || 20;
    opts.width = opts.innerWidth + opts.margin.right + opts.margin.left;
    opts.height = opts.innerHeight + opts.margin.top + opts.margin.bottom;
    return opts;
  }

  function layoutFromInnerHeight(innerHeight, margin, width) {
    margin = margin || {
      top: 20,
      right: 150,
      bottom: 30,
      left: 150
    };
    width = width || 900;

    return {
      margin: margin,
      width: width,
      height: innerHeight + margin.top + margin.bottom,
      innerWidth: width - margin.right - margin.left,
      innerHeight: innerHeight
    };

  }

  function GlobalReviewCtrl(window, reviewApi) {
    var self = this,
      _ = window._;

    this.residents = reviewApi.residents;
    this.categories = reviewApi.categories;
    this.stats = reviewApi.stats;
    this.cursor = {};

    this.filters = {
      chart: {
        year: reviewApi.residents[0],
        sortBy: {
          category: reviewApi.categories[0],
          property: reviewApi.stats[0]
        }
      },
      table: {
        year: reviewApi.residents[0],
        show: {
          category: reviewApi.categories[0],
          property: reviewApi.stats[0]
        }
      }
    };

    this.review = {
      chart: {},
      chartOptions: {
        getLabel: function(row) {
          return row.displayName;
        },
        getValue: function(row) {
          return row.data[self.filters.chart.sortBy.category][self.filters.chart.sortBy.property.id];
        }
      },
      chartRef: null,
      table: {
        sortedBy: 'displayName',
        searchFor: '',
        reversed: null,
        source: {},
        students: [],
      }
    };

    this.getTableData = function() {
      reviewApi.all().then(this.updateTableData.bind(this));
    };

    this.updateTableData = function(data) {
      this.review.table.source = data.review;
      this.filterTableData();
    };

    this.filterTableData = function() {
      if (this.filters.table.year.id) {
        this.review.table.students = _.filter(
          this.review.table.source.students, {
            'PGY': this.filters.table.year.id
          }
        );
      } else {
        this.review.table.students = this.review.table.source.students;
      }

      this.sortTableDataBy(this.review.table.sortedBy);
    };

    this.sortTableDataBy = function(sortBy) {
      var getKey;

      this.review.table.reversed = (
        this.review.table.sortedBy === sortBy &&
        this.review.table.reversed === false
      );

      this.review.table.sortedBy = sortBy;

      if (this.review.table.reversed) {
        this.review.table.students.reverse();
        return;
      }

      switch (sortBy) {
        case 'selected-category':
          getKey = function(student) {
            return student.data[self.filters.table.show.category].result;
          };
          break;
        case 'PGY-average':
          getKey = function(student) {
            return self.review.table.source.overallAverage['PGY ' + student.PGY][self.filters.table.show.category][self.filters.table.show.property.id];
          };
          break;
        case '%-completed':
          getKey = function(student) {
            return student.data[self.filters.table.show.category].completed;
          };
          break;
        case 'probability-of-passing':
          getKey = function(student) {
            return student.data[self.filters.table.show.category].probabilityOfPassing;
          };
          break;
        default:
          getKey = function(student) {
            return student[sortBy];
          };
          break;
      }

      this.review.table.students = _.sortBy(
        this.review.table.students, getKey
      );

    };

    function updateChartData(data) {
      self.cursor.next = data.next;
      self.cursor.prev = data.prev;
      self.review.chart = data.review;
      self.layout = layoutFromInnerHeight(
        self.review.chart.students.length * 20 // 20px per student
      );
      self.review.chartRef = {
        label: 'Average',
        value: data.review.overallAverage[self.filters.chart.year.title][self.filters.chart.sortBy.category][self.filters.chart.sortBy.property.id],
        unit: '%'
      };
    }

    this.getChartData = function() {
      reviewApi.next('', this.filters.chart).then(updateChartData);
    };

    this.nextChartData = function() {
      reviewApi.next(this.cursor.next, this.filters.chart).then(updateChartData);
    };

    this.prevChartData = function() {
      reviewApi.prev(this.cursor.prev, this.filters.chart).then(updateChartData);
    };

    this.chartFiltersChanged = this.getChartData;
    this.tableFiltersChanged = this.filterTableData;
    this.tableSortBy = this.sortTableDataBy;

    this.getChartData();
    this.getTableData();
  }


  angular.module('scdReview.controllers', [
    'scceSvg.directives',
    'scdReview.services',
    'scdSelector.services',
    'scdMisc.filters'
  ]).

  controller('scdGlobalReviewCtrl', [
    '$window',
    'scdReviewApi',
    GlobalReviewCtrl
  ]).

  controller('scdReviewCtrl', ['currentUser', 'scdSelectedStudent', 'scdReviewApi', '$window',
    function(currentUser, scdSelectedStudent, scdReviewApi, $window) {
      var self = this,
        _ = $window._;

      /** Student selector **/

      this.selector = null;
      this.showGlobals = null;
      this.studentPerformance = null;

      this.showGlobalPerformance = function(doShow) {
        self.showGlobals = doShow;
        if (!doShow) {
          return;
        }

        if (!self.selector.available) {
          self.showGlobals = false;
          // TODO: redirect.
        } else {
          self.selector.selectedId = null;
        }
      };

      this.showStudentPerformance = function(studentId) {
        if (!studentId) {
          self.studentPerformance = null;
          self.showGlobalPerformance(true);
          return;
        }

        self.showGlobals = false;
        self.setPerformances();
      };

      scdSelectedStudent().then(function(selector) {
        self.selector = selector;
        self.showStudentPerformance(selector.selectedId);
      });

      /** Student performance **/

      this.comparison = {
        available: [{
          label: 'National Average',
          id: 'nationalAvg',
          type: 'Average'
        }, {
          label: 'University Average',
          id: 'uniAvg',
          type: 'Average'
        }, ],
      };
      this.comparison.selected = this.comparison.available[0];

      this.performances = {
        data: null,
        statsByTopics: null,

        cumulative: {
          series: [],
          ref: null,
          current: null,
          layout: layout({
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
        },

        progress: {
          mainData: {
            title: 'Progress',
            subTitle: 'Percentage completed',
            value: null,
            unit: '%'
          },
          components: null,
          layout: layout({
            innerWidth: 300,
            innerHeight: 149,
            margin: {
              top: 30,
              right: 50,
              bottom: 110,
              left: 50
            },
          })
        },

        abem: {
          layout: layout({
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
            max: 100,
            id: 'ok'
          }],
          reading: {
            value: null,
            unit: '%',
            label: 'Projected ABEM score'
          }
        },

        passing: {
          layout: layout({
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
          }],
          reading: {
            value: null,
            unit: '%',
            label: 'Probability of Passing'
          }
        },

        byCategory: {
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
              return row.name;
            },
            hasRef: function() {
              return self.performances.statsByTopics && self.comparison.selected.id;
            },
            getRef: function(row) {
              return {
                value: self.performances.statsByTopics[row.id][self.comparison.selected.id]
              };
            },
            getUnit: function() {
              return '%';
            },
            getValue: function(row) {
              return row.value;
            },
          }
        }
      };

      this.updateMeters = function(data) {
        this.performances.abem.reading.value = data.abem;
        this.performances.passing.reading.value = data.passingProbability;
      };

      // Other charts needs the data
      this.setPerformances = function(studentId) {
        self.performances.data = null;
        self.performances.statsByTopics = null;

        scdReviewApi.performancesById(studentId).then(function(data) {
          self.performances.data = data;
          self.updateMeters(data);
          self.updateCumulativePerfChart(data);
          self.updateCumulativePerfChartRef(self.comparison.selected);
          self.updateProgressChart(data);
          self.updatePerfByCategoryChart(data);
        });

        scdReviewApi.topicsStats().then(function(stats) {
          self.performances.statsByTopics = stats;
        });
      };

      this.updateCumulativePerfChart = function(data) {
        self.performances.cumulative.series = data.progress;
        self.performances.cumulative.current = {
          label: 'Overall percent correct',
          value: data.cumulativePerformance
        };
      };

      this.updateCumulativePerfChartRef = function(selectedOption) {
        self.performances.cumulative.ref = {
          id: selectedOption.id,
          label: selectedOption.label,
          value: self.performances.data[selectedOption.id]
        };
      };

      this.updateProgressChart = function(data) {
        var correct = data.cumulativePerformance * data.percentageComplete / 100,
          left = 100 - data.percentageComplete;

        this.performances.progress.mainData.value = data.percentageComplete;
        this.performances.progress.components = [{
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
        }];

      };

      this.updatePerfByCategoryChart = function(data) {
        var config = this.performances.byCategory;

        config.series = _.sortBy(data.categoryPerformances, 'id');
        config.layout = layout(_.extend({
            innerHeight: config.baseLayout.rowHeight * data.categoryPerformances.length
          },
          config.baseLayout
        ));
      };
    }
  ])

  ;

})();
