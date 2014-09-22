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

  function GlobalReviewCtrl($scope, window, reviewApi) {
    this._ = window._;
    this.d3 = window.d3;
    this.reviewApi = reviewApi;
    this.scope = $scope;

    $scope.residents = reviewApi.residents;
    $scope.categories = reviewApi.categories;
    $scope.stats = reviewApi.stats;
    $scope.cursor = {};

    $scope.filters = {
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

    $scope.review = {
      chart: {},
      table: {
        sortedBy: 'displayName',
        searchFor: '',
        reversed: null,
        source: {},
        students: [],
      }
    };

    $scope.next = this.nextChartData.bind(this);
    $scope.prev = this.prevChartData.bind(this);
    $scope.chartFiltersChanged = this.getChartData.bind(this);
    $scope.tableFiltersChanged = this.filterTableData.bind(this);
    $scope.tableSortBy = this.sortTableDataBy.bind(this);

    this.getChartData();
    this.getTableData();
  }

  GlobalReviewCtrl.prototype.getTableData = function() {
    this.reviewApi.all().then(this.updateTableData.bind(this));
  };

  GlobalReviewCtrl.prototype.updateTableData = function(data) {
    this.scope.review.table.source = data.review;
    this.filterTableData();
  };

  GlobalReviewCtrl.prototype.filterTableData = function() {
    if (this.scope.filters.table.year.id) {
      this.scope.review.table.students = this._.filter(
        this.scope.review.table.source.students, {
          'PGY': this.scope.filters.table.year.id
        }
      );
    } else {
      this.scope.review.table.students = this.scope.review.table.source.students;
    }

    this.sortTableDataBy(this.scope.review.table.sortedBy);
  };

  GlobalReviewCtrl.prototype.sortTableDataBy = function(sortBy) {
    var getKey,
      self = this;

    this.scope.review.table.reversed = (
      this.scope.review.table.sortedBy === sortBy &&
      this.scope.review.table.reversed === false
    );

    this.scope.review.table.sortedBy = sortBy;

    if (this.scope.review.table.reversed) {
      this.scope.review.table.students.reverse();
      return;
    }

    switch (sortBy) {
      case 'selected-category':
        getKey = function(student) {
          return student.data[self.scope.filters.table.show.category].result;
        };
        break;
      case 'PGY-average':
        getKey = function(student) {
          return self.scope.review.table.source.overallAverage['PGY ' + student.PGY][self.scope.filters.table.show.category][self.scope.filters.table.show.property.id];
        };
        break;
      case '%-completed':
        getKey = function(student) {
          return student.data[self.scope.filters.table.show.category].completed;
        };
        break;
      case 'probability-of-passing':
        getKey = function(student) {
          return student.data[self.scope.filters.table.show.category].probabilityOfPassing;
        };
        break;
      default:
        getKey = function(student) {
          return student[sortBy];
        };
        break;
    }

    this.scope.review.table.students = this._.sortBy(
      this.scope.review.table.students, getKey
    );

  };

  GlobalReviewCtrl.prototype.getChartData = function() {
    this.reviewApi.next('', this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  GlobalReviewCtrl.prototype.nextChartData = function() {
    this.reviewApi.next(this.scope.cursor.next, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  GlobalReviewCtrl.prototype.prevChartData = function() {
    this.reviewApi.prev(this.scope.cursor.prev, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  GlobalReviewCtrl.prototype.updateChartData = function(data) {
    this.scope.cursor.next = data.next;
    this.scope.cursor.prev = data.prev;
    this.scope.review.chart = data.review;
    this.setLayout();
    this.setScales();
  };

  GlobalReviewCtrl.prototype.setScales = function() {
    var self = this;

    if (!this.scope.scales) {
      this.scope.scales = {
        x: this.d3.scale.linear().domain(
          [0, 100]
        ).range(
          [0, this.scope.layout.innerWidth]
        )
      };
    }

    this.scope.scales.y = this.d3.scale.ordinal();
    this.scope.review.chart.students.forEach(function(student) {
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  GlobalReviewCtrl.prototype.setLayout = function() {
    this.scope.layout = layoutFromInnerHeight(this.scope.review.chart.students.length * 20); // 20px per student
  };


  angular.module('scdReview.controllers', [
    'scceSvg.directives',
    'scdReview.services',
    'scdSelector.services',
    'scdMisc.filters'
  ]).

  controller('scdGlobalReviewCtrl', [
    '$scope',
    '$window',
    'scdReviewApi',
    GlobalReviewCtrl
  ]).

  controller('scdReviewCtrl', ['currentUser', 'scdSelectedStudent', 'scdReviewApi', '$window',
    function(currentUser, scdSelectedStudent, scdReviewApi, $window) {
      var self = this,
        d3 = $window.d3,
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
          self.setCumulativePerformanceScales(data);
          self.setCumulativePerformanceRef(self.comparison.selected);
          self.setProgressScales(data);
          self.setPerformanceByCategory(data);
        });

        scdReviewApi.topicsStats().then(function(stats) {
          self.performances.statsByTopics = stats;
        });
      };

      this.setCumulativePerformanceScales = function(data) {
        self.performances.cumulative.series = data.progress;
        self.performances.cumulative.current = {
          label: 'Overall percent correct',
          value: data.cumulativePerformance
        };
      };

      this.setCumulativePerformanceRef = function(selectedOption) {
        self.performances.cumulative.ref = {
          id: selectedOption.id,
          label: selectedOption.label,
          value: self.performances.data[selectedOption.id]
        };
      };

      this.setProgressScales = function(data) {
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

      this.setPerformanceByCategory = function(data) {
        var config = this.performances.byCategory;

        config.layout = layout(_.extend({
            innerHeight: config.baseLayout.rowHeight * data.categoryPerformances.length
          },
          config.baseLayout
        ));

        // init scales
        config.xScale = d3.scale.linear();
        config.yScale = d3.scale.ordinal();

        // set domain
        config.xScale.domain([0, 100]);
        config.yScale.domain(
          _(data.categoryPerformances).map('id').sort().value()
        );

        // set ranges
        config.xScale.range([0, config.layout.innerWidth]);
        config.yScale.rangeBands([0, config.layout.innerHeight], 0, 0);
      };
    }
  ])

  ;

})();
