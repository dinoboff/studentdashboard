(function() {
  'use strict';

  function layout(innerHeight, margin, width) {
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

  function ReviewCtrl($scope, window, reviewApi) {
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
        sortedBy: 'firstName',
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

  ReviewCtrl.prototype.getTableData = function() {
    this.reviewApi.all().then(this.updateTableData.bind(this));
  };

  ReviewCtrl.prototype.updateTableData = function(data) {
    this.scope.review.table.source = data.review;
    this.filterTableData();
  };

  ReviewCtrl.prototype.filterTableData = function() {
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

  ReviewCtrl.prototype.sortTableDataBy = function(sortBy) {
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

    switch(sortBy) {
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

  ReviewCtrl.prototype.getChartData = function() {
    this.reviewApi.next('', this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  ReviewCtrl.prototype.nextChartData = function() {
    this.reviewApi.next(this.scope.cursor.next, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  ReviewCtrl.prototype.prevChartData = function() {
    this.reviewApi.prev(this.scope.cursor.prev, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  ReviewCtrl.prototype.updateChartData = function(data) {
    this.scope.cursor.next = data.next;
    this.scope.cursor.prev = data.prev;
    this.scope.review.chart = data.review;
    this.setLayout();
    this.setScales();
  };

  ReviewCtrl.prototype.setScales = function() {
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


  ReviewCtrl.prototype.setLayout = function() {
    this.scope.layout = layout(this.scope.review.chart.students.length * 20); // 20px per student
  };


  angular.module('scdReview.controllers', ['scceSvg.directives', 'scdReview.services']).

  controller('scdReviewCtrl', ['$scope', '$window', 'scdReviewApi', ReviewCtrl])

  ;

})();