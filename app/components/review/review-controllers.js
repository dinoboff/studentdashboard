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
      table: {}
    };

    $scope.chartFiltersChanged = this.getData.bind(this);
    $scope.next = this.nextData.bind(this);
    $scope.prev = this.prevData.bind(this);
    $scope.chartFiltersChanged = this.getData.bind(this);

    this.getData();
  }

  ReviewCtrl.prototype.getData = function() {
    this.reviewApi.next('', this.scope.filters.chart).then(this.updateData.bind(this));
  };

  ReviewCtrl.prototype.nextData = function() {
    this.reviewApi.next(this.scope.cursor.next, this.scope.filters.chart).then(this.updateData.bind(this));
  };

  ReviewCtrl.prototype.prevData = function() {
    this.reviewApi.prev(this.scope.cursor.prev, this.scope.filters.chart).then(this.updateData.bind(this));
  };

  ReviewCtrl.prototype.updateData = function (data) {
    this.scope.cursor.next = data.next;
    this.scope.cursor.prev = data.prev;
    this.scope.review = data.review;
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
    this.scope.review.students.forEach(function(student) {
      student.fullName = student.firstName + ' ' + student.lastName;
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  ReviewCtrl.prototype.setLayout = function() {
    this.scope.layout = layout(this.scope.review.students.length * 20); // 20px per student
  };


  angular.module('scdReview.controllers', ['scceSvg.directives', 'scdReview.services']).

  controller('scdReviewCtrl', ['$scope', '$window', 'scdReviewApi', ReviewCtrl])

  ;

})();