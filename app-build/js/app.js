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
    'scceStudents.services'
  ]).

  config(['$routeProvider',
    function($routeProvider) {
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
(function() {
  'use strict';

  angular.module('scDashboard.config', []).

  constant('SCD_API_BASE', '/api/v1/dashboard')

  ;

})();
(function() {
  'use strict';

  var interceptor = function(data, operation, what) {
    var resp;

    if (operation === 'getList') {
      resp = data[what] ? data[what] : [];
      resp.cursor = data.cursor ? data.cursor : null;
    } else {
      resp = data;
    }
    return resp;
  };

  angular.module('scDashboard.services', ['restangular', 'scDashboard.config', 'scceUser.services']).

  service('scdDashboardApi', ['Restangular', 'SCD_API_BASE',
    function(Restangular, SCD_API_BASE) {
      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(SCD_API_BASE);
        RestangularConfigurer.addResponseInterceptor(interceptor);
      });
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scDashboard.controllers', [
    'scceUser.directives',
    'scceUser.services',
    'scDashboard.services'
  ]).

  controller('scdNavBarCtrl', ['$scope', '$location', 'scceCurrentUserApi',
    function($scope, $location, currentUserApi) {
      $scope.currentUser = null;

      $scope.isActive = function(route, exactMatch) {
        if (exactMatch) {
          return $location.path() === route;
        } else {
          return ($location.path() + '').indexOf(route) === 0;
        }
      };

      currentUserApi.auth().then(function(user) {
        $scope.currentUser = user;
      });
    }
  ])

  ;

})();
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

  function FirstAidCtrl($scope, currentUser, window, firstAidApi) {
    this._ = window._;
    this.d3 = window.d3;
    this.firstAidApi = firstAidApi;
    this.scope = $scope;

    $scope.residents = firstAidApi.residents;
    $scope.categories = firstAidApi.categories;
    $scope.stats = firstAidApi.stats;
    $scope.cursor = {};

    $scope.filters = {
      chart: {
        year: firstAidApi.residents[0],
        sortBy: {
          category: firstAidApi.categories[0],
          property: firstAidApi.stats[0]
        }
      },
      table: {
        year: firstAidApi.residents[0],
        show: {
          category: firstAidApi.categories[0],
          property: firstAidApi.stats[0]
        }
      }
    };

    $scope.firstAid = {
      chart: {},
      table: {
        sortedBy: 'firstName',
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

  FirstAidCtrl.prototype.getTableData = function() {
    this.firstAidApi.all().then(this.updateTableData.bind(this));
  };

  FirstAidCtrl.prototype.updateTableData = function(data) {
    this.scope.firstAid.table.source = data.firstAid;
    this.filterTableData();
  };

  FirstAidCtrl.prototype.filterTableData = function() {
    if (this.scope.filters.table.year.id) {
      this.scope.firstAid.table.students = this._.filter(
        this.scope.firstAid.table.source.students, {
          'PGY': this.scope.filters.table.year.id
        }
      );
    } else {
      this.scope.firstAid.table.students = this.scope.firstAid.table.source.students;
    }

    this.sortTableDataBy(this.scope.firstAid.table.sortedBy);
  };

  FirstAidCtrl.prototype.sortTableDataBy = function(sortBy) {
    var getKey,
      self = this;

    this.scope.firstAid.table.reversed = (
      this.scope.firstAid.table.sortedBy === sortBy &&
      this.scope.firstAid.table.reversed === false
    );

    this.scope.firstAid.table.sortedBy = sortBy;

    if (this.scope.firstAid.table.reversed) {
      this.scope.firstAid.table.students.reverse();
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
        return self.scope.firstAid.table.source.overallAverage['PGY ' + student.PGY][self.scope.filters.table.show.category][self.scope.filters.table.show.property.id];
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

    this.scope.firstAid.table.students = this._.sortBy(
      this.scope.firstAid.table.students, getKey
    );

  };

  FirstAidCtrl.prototype.getChartData = function() {
    this.firstAidApi.next('', this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  FirstAidCtrl.prototype.nextChartData = function() {
    this.firstAidApi.next(this.scope.cursor.next, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  FirstAidCtrl.prototype.prevChartData = function() {
    this.firstAidApi.prev(this.scope.cursor.prev, this.scope.filters.chart).then(this.updateChartData.bind(this));
  };

  FirstAidCtrl.prototype.updateChartData = function(data) {
    this.scope.cursor.next = data.next;
    this.scope.cursor.prev = data.prev;
    this.scope.firstAid.chart = data.firstAid;
    this.setLayout();
    this.setScales();
  };

  FirstAidCtrl.prototype.setScales = function() {
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
    this.scope.firstAid.chart.students.forEach(function(student) {
      self.scope.scales.y(student.id);
    });
    this.scope.scales.y = this.scope.scales.y.rangePoints([this.scope.layout.innerHeight, 0], 1);
  };


  FirstAidCtrl.prototype.setLayout = function() {
    this.scope.layout = layout(this.scope.firstAid.chart.students.length * 20); // 20px per student
  };


  angular.module('scdFirstAid.controllers', ['scceSvg.directives', 'scdFirstAid.services']).

  controller('scdFirstAidCtrl', ['$scope', 'currentUser', '$window', 'scdFirstAidApi', FirstAidCtrl])

  ;

})();
(function() {
  'use strict';

  var firstNames = [
      'Noah', 'Liam', 'Jacob', 'Mason', 'William', 'Ethan', 'Michael',
      'Sophia', 'Emma', 'Olivia', 'Isabella', 'Ava', 'Mia', 'Emily'
    ],
    lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
      'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor',
      'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson',
      'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis'
    ],
    residents = [{
      'id': 1,
      'title': 'PGY 1',
    }, {
      'id': 2,
      'title': 'PGY 2',
    }, {
      'id': 3,
      'title': 'PGY 3'
    }],
    categories = [
      'Traumatic Disorders',
      'Cardiovascular Disorders'
    ],
    stats = [{
      'id': 'result',
      'title': 'Program Average'
    }, {
      'id': 'completed',
      'title': 'Percentage Completed'
    }, {
      'id': 'probabilityOfPassing',
      'title': 'Probability of Passing ABEM'
    }];

  function newUser(index, _) {
    return {
      'id': 'x' + index,
      'firstName': _.sample(firstNames),
      'lastName': _.sample(lastNames),
      'PGY': _.sample(residents).id,
      'data': newResults(_)
      // 'completed': _.random(0, 100),
      // 'probabilityOfPassing': _.random(50, 100)
    };
  }

  function newResults(_) {
    var results = {},
      allCategories = {};

    categories.forEach(function(name) {
      results[name] = newCategoryResults(_);
    });

    stats.map(function(s) {
      var avg = _.reduce(results, function(avg, result) {
        avg.count++;
        avg.sum += result[s.id];
        return avg;
      }, {
        count: 0,
        sum: 0
      });

      allCategories[s.id] = avg.sum / avg.count; // assume all categories weight the same
    });

    results['All Categories'] = allCategories;

    return results;
  }

  function newCategoryResults(_) {
    return {
      'result': _.random(50, 99),
      'completed': _.random(1, 100),
      'probabilityOfPassing': _.random(50, 100),
    };
  }

  function calcOverallAverage(users, _) {
    var results = {
      'All Residents': _calcOverallAverage(users, _)
    };

    residents.forEach(function(year) {
      results[year.title] = _calcOverallAverage(_.filter(users, {
        'PGY': year.id
      }), _);
    });

    return results;
  }

  function _calcOverallAverage(users, _) {
    var results = {};

    categories.concat(['All Categories']).forEach(function(category) {
      results[category] = {};
      stats.forEach(function(stat) {
        var avg = _.reduce(users, function(avg, user) {
          avg.count++;
          avg.sum += user.data[category][stat.id];
          return avg;
        }, {
          count: 0,
          sum: 0
        });

        results[category][stat.id] = avg.sum / avg.count;
      });
    });

    return results;
  }

  function getCursor(cursor, defaultValue) {
    if (!cursor) {
      return defaultValue;
    } else {
      return parseInt(cursor, 10);
    }
  }

  function setCursor(results, pool, prev, next) {
    results.prev = prev > 0 ? prev : '';
    results.next = next < pool.length ? next : '';
    return results;
  }

  angular.module('scdFirstAid.services', []).

  factory('scdFirstAidApi', ['$window', '$q',
    function(window, $q) {
      var _ = window._,
        users = _.range(1, 61).map(function(index) {
          return newUser(index, _);
        }),
        average = calcOverallAverage(users, _);

      return {
        categories: ['All Categories'].concat(categories),
        residents: [{
          'title': 'All Residents',
          'id': ''
        }].concat(residents),
        stats: stats,

        _get: function(start, end, opt) {
          var pool = users;

          if (opt && opt.year && opt.year.id) {
            pool = _.filter(pool, {
              'PGY': opt.year.id
            });
          }


          if (opt && opt.sortBy && opt.sortBy.category && opt.sortBy.property && opt.sortBy.property.id) {
            pool = _.sortBy(pool, function(student) {
              if (
                student.data[opt.sortBy.category] &&
                student.data[opt.sortBy.category][opt.sortBy.property.id]
              ) {
                return -student.data[opt.sortBy.category][opt.sortBy.property.id];
              }
            });
          }

          return $q.when(
            setCursor({
              'firstAid': {
                'overallAverage': average,
                'students': pool.slice(start, end)
              }
            }, pool, start, end)
          );
        },

        next: function(cursor, options) {
          var start, end;

          cursor = getCursor(cursor, 0);
          start = cursor;
          end = cursor + 20;
          return this._get(start, end, options);
        },

        prev: function(cursor, options) {
          var start, end;

          cursor = getCursor(cursor, 20);
          start = cursor - 20;
          end = cursor;
          return this._get(start, end, options);
        },

        all: function() {
          return $q.when({
            'firstAid': {
              'overallAverage': average,
              'students': _.clone(users)
            },
            'prev': '',
            'next': ''
          });
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdMisc.filters', []).

  filter('fullName', function() {
    return function(name) {
      return name.givenName + ' ' + name.familyName;
    };
  }).

  filter('percent', ['$window',
    function(window) {
      var d3 = window.d3,
        formatter = d3.format('.00%');

      return function(v) {
        return formatter(v);
      };
    }
  ]).

  filter('dash', function() {
    return function(v) {
      return v.replace(' ', '-');
    };
  }).


  filter('isEmpty', function() {
    return function(o) {
      return !o || Object.keys(o).length === 0;
    };
  }).

  filter('rotate', function() {
    return function(angle) {
      return {
        '-webkit-transform': 'rotate(' + angle + 'deg)',
        '-moz-transform': 'rotate(' + angle + 'deg)',
        '-ms-transform': 'rotate(' + angle + 'deg)',
        'transform': 'rotate(' + angle + 'deg)'
      };
    };
  })

  ;

})();
(function() {
  'use strict';

  /**
   * Portfolio controller
   *
   */
  function PortfolioCtrl(currentUser, selectedStudent, pfApi) {
    var self = this;

    this.pfApi = pfApi;
    this.portfolio = null;
    this.selector = null;

    selectedStudent().then(function(selector) {
      self.selector = selector;
      if (selector.selectedId) {
        self.loadPortfolio(selector.selectedId);
      }
    });
  }

  PortfolioCtrl.prototype.loadPortfolio = function(studentId) {
    var self = this;

    if (!studentId) {
      self.portfolio = null;
      return;
    }

    this.pfApi.getById(studentId).then(function(pf) {
      self.portfolio = pf;
    });
  };

  /**
   * Exam controller
   *
   */
  function PfExamCtrl(currentUser, $routeParams, currentUserApi, $q, pfApi, window, layout) {
    var self = this,
      studentId = $routeParams.studentId,
      examId = $routeParams.examId,
      d3 = window.d3,
      _ = window._;

    this.exam = null;
    this.layout = layout({
      top: 10,
      right: 10,
      bottom: 30,
      left: 300
    });

    this.xScale = d3.scale.linear().domain(
      [-2, 2]
    ).range(
      [0, this.layout.innerWidth]
    );
    this.ticks = _.range(-20, 21).map(function(x) {
      return x / 10;
    });
    this.yScale = d3.scale.ordinal();

    currentUserApi.auth().then(function(user) {
      if (!user.isStaff && !user.isAdmin && user.id !== studentId) {
        return $q.reject('You do not have permission to see those results');
      }
      return pfApi.getExamById(studentId, examId);
    }).then(function(exam) {

      self.exam = exam;

      _.forEach(exam.results, function(result) {
        self.yScale(result.topic.name);
      });
      self.yScale = self.yScale.rangePoints([self.layout.innerHeight, 0], 1);
    }).catch(function() {
      // TODO: proper handling of error.
      window.alert('failed to load the exam results.');
    });
  }

  /**
   * Evaluation controller
   *
   */
  function PfEvaluationCtrl(currentUser, params, currentUserApi, $q, pfApi) {
    var self = this,
      studentId = params.studentId,
      evaluationId = params.evaluationId;

    this.evaluation = null;

    currentUserApi.auth().then(function(user) {
      if (!user.isStaff && !user.isAdmin && user.id !== studentId) {
        return $q.reject('You do not have permission to see those results');
      }
      return pfApi.getEvaluationById(studentId, evaluationId);
    }).then(function(evaluation) {
      self.evaluation = evaluation;
    }).catch(function() {
      // TODO: proper handling of error.
      window.alert('failed to load the evaluation results.');
    });
  }


  angular.module('scdPortfolio.controllers', ['scceUser.services', 'scdSelector.services', 'scdPortFolio.services']).

  controller('scdPortfolioCtrl', ['currentUser', 'scdSelectedStudent', 'scdPorfolioApi', PortfolioCtrl]).
  controller('scdPfExamCtrl', [
    'currentUser',
    '$routeParams',
    'scceCurrentUserApi',
    '$q',
    'scdPorfolioApi',
    '$window',
    'scdPfSvgLayout',
    PfExamCtrl
  ]).
  controller('scdPfEvaluationCtrl', [
    'currentUser',
    '$routeParams',
    'scceCurrentUserApi',
    '$q',
    'scdPorfolioApi',
    PfEvaluationCtrl
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdPortFolio.services', ['scDashboard.services']).

  factory('scdPorfolioApi', ['scdDashboardApi',
    function(dashboardApi) {
      return {
        getById: function(userId) {
          return dashboardApi.all('portfolio').get(userId);
        },

        getExamById: function(userId, examId) {
          return dashboardApi.one(
            'portfolio', userId
          ).all('exam').get(examId);
        },

        getEvaluationById: function(userId, evaluationId) {
          return dashboardApi.one(
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
(function() {
  'use strict';

  angular.module(
    'scdRepository.controllers', [
      'angularFileUpload',
      'scceStudents.services',
      'scceUser.services',
      'scDashboard.services',
      'scdRepository.directives',
      'scdRepository.services',
      'scdSelector.services'
    ]
  ).

  controller('scdRepositoryListCtrl', ['$scope', 'currentUser', 'scdRepositoryApi', '$q', 'scdSelectedStudent',
    function($scope, currentUser, scdRepositoryApi, $q, selectedStudent) {
      $scope.files = null;
      $scope.selector = null;

      selectedStudent().then(function(selector) {
        $scope.selector = selector;
        $scope.listFile(selector.selectedId);
      }).catch(function(){
        $scope.error = 'You need to be logged to list a repository';
        $scope.files = [];
      });

      $scope.listFile = function(studentId) {
        if (!studentId) {
          $scope.files = [];
          return $q.reject('You need to select a student.');
        }

        $scope.files = null;
        return scdRepositoryApi.getRepositoryById(studentId).then(function(list) {
          $scope.files = list;
          return list;
        }).catch (function(resp) {
          $scope.files = [];
          if (resp.status === 401) {
            $scope.error = 'You need to be logged to list a repository';
          } else if (resp.status === 403) {
            $scope.error = 'Only admin or staff can list the files of a student.';
          } else {
            $scope.error = 'Unexpected error while trying to fetch the file list';
          }
        });
      };
    }
  ]).

  controller('scdRepositoryUploadFileCtrl', ['$scope', '$upload', 'scdRepositoryApi',
    function($scope,$upload, scdRepositoryApi) {
      $scope.docTypes = ['SHELF', 'USMLE', 'Peer Evaluations'];
      $scope.selected = {};

      function onProgress(evt) {
        $scope.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      }

      function onSucess(data) {
        $scope.files.unshift(data);
        $scope.success = 'New file uploaded.';
        $scope.selected.file = null;
        $scope.reset();
      }

      function uploadFile(file) {
        scdRepositoryApi.newUploadUrl($scope.selector.selectedId).then(function(uploadInfo) {
          $scope.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: $scope.fileMeta.name || file.name,
              docType: $scope.fileMeta.docType,
              destId: $scope.selector.selectedId
            },
            file: file
          }).progress(
            onProgress
          ).success(
            onSucess
          );
        });

      }

      $scope.reset = function() {
        $scope.fileMeta = {};
        $scope.selected.file = null;
        $scope.showProgress = false;
        $scope.progress = 0;
      };

      $scope.onFileSelect = function(file) {
        $scope.fileMeta.name = file.name;
      };

      $scope.uploadButtonClicked = function(file) {
        uploadFile(file);
        $scope.showProgress = true;
      };

      $scope.reset();
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdRepository.directives', []).


  directive('scdFile', ['$parse',
    function($parse) {
      return {
        link: function($scope, elem, attr) {
          var onSelect = $parse(attr.scdSelected),
            fileSetter = $parse(attr.scdFile).assign;

          elem.bind('change', function(evt) {
            var files = [],
              fileList, i;

            fileList = evt.target.files;
            if (fileList !== null) {
              for (i = 0; i < fileList.length; i++) {
                files.push(fileList.item(i));
              }
            }

            fileSetter($scope, files.length > 0 ? files[0] : null);
            onSelect($scope);
            $scope.$digest();
          });

          elem.bind('click', function() {
            this.value = null;
          });

          $scope.$watch(attr.scdFile, function(newVal) {
            if (!newVal) {
              elem.get(0).value = null;
            }
          });
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdRepository.services', ['scDashboard.services']).

  factory('scdRepositoryApi', ['scdDashboardApi',
    function(scdDashboardApi) {
      return {
        getRepositoryById: function(studentId) {
          return scdDashboardApi.one('repository', studentId).all('files').getList();
        },
        newUploadUrl: function(studentId) {
          return scdDashboardApi.one('repository', studentId).one('uploadurl').post();
        }
      };
    }
  ])

  ;

})();
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
          layout: layout({
            innerWidth: 400,
            innerHeight: 360,
            margin: {
              top: 20,
              right: 150,
              bottom: 30,
              left: 70
            },
          })
        },

        progress: {
          pieData: null,
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
            value: 75,
            id: 'danger'
          }, {
            value: 25,
            id: 'ok'
          }]
        },

        passing: {
          layout: layout({
            innerWidth: 100,
            innerHeight: 55,
            margin: {
              top: 12,
              right: 12,
              bottom: 50,
              left: 12
            },
          }),
          steps: [{
            value: 75,
            id: 'danger'
          }, {
            value: 15,
            id: 'warning'
          }, {
            value: 10,
            id: 'ok'
          }]
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

      // Set meters data
      function meterScales(config) {
        var outerRadius = config.outerRadius = layout2HalfPieRadius(
            self.performances.abem.layout, 2
          ),
          innerRadius = config.innerRadius = outerRadius - 12;

        // setup arcs
        config.arc = arc(outerRadius, innerRadius);

        // slices
        config.slices = d3.layout.pie().sort(null).value(function(d) {
          return d.value;
        }).startAngle(-Math.PI / 2).endAngle(Math.PI / 2)(config.steps);
      }

      meterScales(this.performances.abem);
      meterScales(this.performances.passing);

      // Other charts needs the data
      this.setPerformances = function(studentId) {
        self.performances.data = null;
        self.performances.statsByTopics = null;

        scdReviewApi.performancesById(studentId).then(function(data) {
          self.performances.data = data;
          self.setCumulativePerformanceScales(data);
          self.setProgressScales(data);
          self.setPerformanceByCategory(data);
        });

        scdReviewApi.topicsStats().then(function(stats) {
          self.performances.statsByTopics = stats;
        });
      };

      this.setCumulativePerformanceScales = function(data) {
        var xTicks;
        // init scales
        self.performances.cumulative.xScale = d3.scale.ordinal();
        self.performances.cumulative.yScale = d3.scale.linear();
        xTicks = d3.time.scale();
        self.performances.cumulative.ticksFormatter = d3.time.format('%b %y');

        // setup scale domains
        self.performances.cumulative.yScale.domain([0, 100]);
        xTicks.domain([
          data.progress[0].date,
          data.progress[data.progress.length - 1].date
        ]);
        data.progress.forEach(function(day) {
          self.performances.cumulative.xScale(day.date);
        });

        // setup scale ranges
        self.performances.cumulative.yScaleReversed = (
          self.performances.cumulative.yScale.copy().range(
            [self.performances.cumulative.layout.innerHeight, 0]
          )
        );
        self.performances.cumulative.yScale.range(
          [0, self.performances.cumulative.layout.innerHeight]
        );
        self.performances.cumulative.xScale.rangeBands(
          [0, self.performances.cumulative.layout.innerWidth], 0, 0
        );

        // Set x ticks
        self.performances.cumulative.xTicks = xTicks.ticks(3);
        self.performances.cumulative.ticksFormatter = d3.time.format('%b %y');
      };

      function layout2Radius(layout) {
        // Make sure the pie fits into the inner svg document
        if (layout.innerHeight > layout.innerWidth) {
          return layout.innerWidth / 2;
        } else {
          return layout.innerHeight / 2;
        }
      }

      function layout2HalfPieRadius(layout) {
        // Make sure the half pie fits into the inner svg height
        if (layout.innerWidth / 2 < layout.innerHeight) {
          return layout.innerWidth / 2;
        } else {
          return layout.innerHeight;
        }
      }

      function arc(radius, innerRadius) {
        return d3.svg.arc()
          .startAngle(function(d) {
            return d.startAngle;
          })
          .endAngle(function(d) {
            return d.endAngle;
          })
          .innerRadius(innerRadius || 0)
          .outerRadius(radius);
      }

      function shifter(arc) {
        return function(slice, margin) {
          var c = arc.centroid(slice),
            x = c[0],
            y = c[1],
            h = Math.sqrt(x * x + y * y);

          return 'translate(' +
            (x / h * margin) + ',' +
            (y / h * margin) +
            ')';
        };
      }

      this.setProgressScales = function(data) {
        var correct = data.cumulativePerformance * data.percentageComplete / 100,
          left = 100 - data.percentageComplete,
          pieData = [{
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
          }],
          pieRadius = layout2Radius(self.performances.progress.layout),
          labelMargin = pieRadius + this.performances.progress.layout.margin.top / 2;

        // Calculate start and end angles of each slice of the pie.
        this.performances.progress.slices = d3.layout.pie().sort(null).value(function(d) {
          return d.value;
        })(pieData);

        // Setup the arc path generator.
        this.performances.progress.arc = arc(pieRadius);

        //Helper to shift a slice away from the center of of the pie
        this.performances.progress.shiftSlice = shifter(this.performances.progress.arc);

        //Helper method to position label
        this.performances.progress.label = function(slice, margin) {
          margin = (margin || 0) + labelMargin;

          return self.performances.progress.shiftSlice(slice, margin);
        };

        this.performances.progress.pastCenter = function(slice) {
          return (slice.endAngle + slice.startAngle) / 2 > Math.PI;
        };

      };

      this.setPerformanceByCategory = function(data) {
        var config = this.performances.byCategory;

        config.layout = layout(
          _.extend(
            {innerHeight: config.baseLayout.rowHeight * data.categoryPerformances.length},
            config.baseLayout
          )
        );

        // init scales
        config.xScale = d3.scale.linear();
        config.yScale = d3.scale.ordinal();

        // set domain
        config.xScale.domain([0,100]);
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
/**
 * Only used to feed the dummy rosh review charts.
 *
 * As more details emerges about the upcoming Rosh Review api, the client
 * will be rewritten.
 *
 * TODO: replace all(), next() and prev() by something getAllStudents().
 * TODO: get stats out of all() result.
 *
 *
 */
(function() {
  'use strict';

  var firstNames = [
      'Noah', 'Liam', 'Jacob', 'Mason', 'William', 'Ethan', 'Michael',
      'Sophia', 'Emma', 'Olivia', 'Isabella', 'Ava', 'Mia', 'Emily'
    ],
    lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
      'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor',
      'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson',
      'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis'
    ],
    residents = [{
      'id': 1,
      'title': 'PGY 1',
    }, {
      'id': 2,
      'title': 'PGY 2',
    }, {
      'id': 3,
      'title': 'PGY 3'
    }],
    categories = [
      'Traumatic Disorders',
      'Cardiovascular Disorders'
    ],
    stats = [{
      'id': 'result',
      'title': 'Program Average'
    }, {
      'id': 'completed',
      'title': 'Percentage Completed'
    }, {
      'id': 'probabilityOfPassing',
      'title': 'Probability of Passing ABEM'
    }];

  function newUser(index, _) {
    var name = {
      givenName: _.sample(firstNames),
      familyName: _.sample(lastNames)
    };

    return {
      'id': '' + index,
      'displayName': name.givenName + ' ' + name.familyName,
      'name': name,
      'PGY': _.sample(residents).id,
      'data': newResults(_)
      // 'completed': _.random(0, 100),
      // 'probabilityOfPassing': _.random(50, 100)
    };
  }

  function newResults(_) {
    var results = {},
      allCategories = {};

    categories.forEach(function(name) {
      results[name] = newCategoryResults(_);
    });

    stats.map(function(s) {
      var avg = _.reduce(results, function(avg, result) {
        avg.count++;
        avg.sum += result[s.id];
        return avg;
      }, {
        count: 0,
        sum: 0
      });

      allCategories[s.id] = avg.sum / avg.count; // assume all categories weight the same
    });

    results['All Categories'] = allCategories;

    return results;
  }

  function newCategoryResults(_) {
    return {
      'result': _.random(50, 99),
      'completed': _.random(1, 100),
      'probabilityOfPassing': _.random(50, 100),
    };
  }

  function calcOverallAverage(users, _) {
    var results = {
      'All Residents': _calcOverallAverage(users, _)
    };

    residents.forEach(function(year) {
      results[year.title] = _calcOverallAverage(_.filter(users, {
        'PGY': year.id
      }), _);
    });

    return results;
  }

  function _calcOverallAverage(users, _) {
    var results = {};

    categories.concat(['All Categories']).forEach(function(category) {
      results[category] = {};
      stats.forEach(function(stat) {
        var avg = _.reduce(users, function(avg, user) {
          avg.count++;
          avg.sum += user.data[category][stat.id];
          return avg;
        }, {
          count: 0,
          sum: 0
        });

        results[category][stat.id] = avg.sum / avg.count;
      });
    });

    return results;
  }

  function getCursor(cursor, defaultValue) {
    if (!cursor) {
      return defaultValue;
    } else {
      return parseInt(cursor, 10);
    }
  }

  function setCursor(results, pool, prev, next) {
    results.prev = prev > 0 ? prev : '';
    results.next = next < pool.length ? next : '';
    return results;
  }

  angular.module('scdReview.services', []).

  factory('scdReviewApi', ['$window', '$q',
    function(window, $q) {
      var _ = window._,
        d3 = window.d3,
        users = _.range(1, 61).map(function(index) {
          return newUser(index, _);
        }),
        average = calcOverallAverage(users, _);

      return {
        categories: ['All Categories'].concat(categories),
        residents: [{
          'title': 'All Residents',
          'id': ''
        }].concat(residents),
        stats: stats,

        _get: function(start, end, opt) {
          var pool = users;

          if (opt && opt.year && opt.year.id) {
            pool = _.filter(pool, {
              'PGY': opt.year.id
            });
          }


          if (opt && opt.sortBy && opt.sortBy.category && opt.sortBy.property && opt.sortBy.property.id) {
            pool = _.sortBy(pool, function(student) {
              if (
                student.data[opt.sortBy.category] &&
                student.data[opt.sortBy.category][opt.sortBy.property.id]
              ) {
                return -student.data[opt.sortBy.category][opt.sortBy.property.id];
              }
            });
          }

          return $q.when(
            setCursor({
              'review': {
                'overallAverage': average,
                'students': pool.slice(start, end)
              }
            }, pool, start, end)
          );
        },

        next: function(cursor, options) {
          var start, end;

          cursor = getCursor(cursor, 0);
          start = cursor;
          end = cursor + 20;
          return this._get(start, end, options);
        },

        prev: function(cursor, options) {
          var start, end;

          cursor = getCursor(cursor, 20);
          start = cursor - 20;
          end = cursor;
          return this._get(start, end, options);
        },

        all: function() {
          return $q.when({
            'review': {
              'overallAverage': average,
              'students': _.clone(users)
            },
            'prev': '',
            'next': ''
          });
        },

        topics: [{
          'name': 'Systemic Infectious Disorders',
          'id': 'SYSTEMIC INFECTIOUS DISORDERS'
        }, {
          'name': 'Psychosocial Disorders',
          'id': 'PSYCHOSOCIAL DISORDERS'
        }, {
          'name': 'Signs, Symptoms, & Presentations',
          'id': 'SIGNS, SYMPTOMS, & PRESENTATIONS'
        }, {
          'name': 'Nervous System Disorders',
          'id': 'NERVOUS SYSTEM DISORDERS'
        }, {
          'name': 'Mskl Disorders (Nontraumatic)',
          'id': 'MSKL DISORDERS (NONTRAUMATIC)'
        }, {
          'name': 'Ob/Gyn Disorders',
          'id': 'OB/GYN DISORDERS'
        }, {
          'name': 'Cutaneous Disorders',
          'id': 'CUTANEOUS DISORDERS'
        }, {
          'name': 'Immune System Disorders',
          'id': 'IMMUNE SYSTEM DISORDERS'
        }, {
          'name': 'Hematologic Disorders',
          'id': 'HEMATOLOGIC DISORDERS'
        }, {
          'name': 'Cardiovascular Disorders',
          'id': 'CARDIOVASCULAR DISORDERS'
        }, {
          'name': 'Endocrine/Metabolic Disorders',
          'id': 'ENDOCRINE/METABOLIC DISORDERS'
        }, {
          'name': 'Abdominal And Gi Disorders',
          'id': 'ABDOMINAL AND GI DISORDERS'
        }],

        performancesById: function() {
          var self = this,
            today = new Date(),
            start = d3.time.year.offset(today, -1),
            data = {
              nationalAvg: _.random(65, 80),
              uniAvg: _.random(60, 85),
              percentageComplete: _.random(0, 100),
              abem: _.random(50, 100),
              passingProbability: _.random(50, 100),
              cumulativePerformance: 70,
              progress: [],
              categoryPerformances: _.sample(
                self.topics, _.random(1, self.topics.length)
              ).map(function(topic) {
                return _.extend({
                  value: _.random(50, 100)
                }, topic);
              })
            };

          data.progress = d3.time.day.range(start, today).map(function(date) {
            var newVal = _.random(
              data.cumulativePerformance - 1, data.cumulativePerformance + 1
            );

            data.cumulativePerformance = _.max([0, _.min([newVal, 100])]);
            return {
              date: date,
              performance: data.cumulativePerformance
            };
          });

          return $q.when(data);
        },

        topicsStats: function() {
          var data = {};

          this.topics.forEach(function(topic) {
            data[topic.id] = _.extend({
              nationalAvg: _.random(65, 80),
              uniAvg: _.random(60, 85)
            }, topic);
          });

          return $q.when(data);
        }
      };
    }
  ])

  ;

})();
(function() {
  'use strict';

  angular.module('scdSelector.services', [
    'scceStudents.services',
    'scceUser.services',
  ]).

  /**
   * Get a list of student and keep tract of a selected student.
   *
   * Can be share by directive and controller to keep track of which student
   * the current user is watching or editing.
   *
   * If the current user is not an admin or staff, he won't be able to pick and
   * the selected user will be the current user (assuming he's a student).
   *
   * Return a promising resolving to a selector object with the
   * following properties:
   *
   * - `students` (list of student selectable),
   * - `selectedId` (id of the selected student),
   * - `available` (can the current user select a student other than
   *   him / herself)
   *
   */
  factory('scdSelectedStudent', ['scceCurrentUserApi', 'scceStudentsApi', '$q',
    function(scceCurrentUserApi, scceStudentsApi, $q) {
      var selector = null,
        selectorPromise = null,
        studentsPromise = null;

      function listStudents(selector) {
        if (selector.students || studentsPromise) {
          return;
        }

        studentsPromise = scceStudentsApi.all().then(function(studentList) {
          selector.students = studentList;
        })['finally'](function() {
          studentsPromise = null;
        });
      }

      return function() {
        if (selector) {
          return $q.when(selector);
        }

        if (selectorPromise) {
          return $q.when(selectorPromise);
        }

        selectorPromise = scceCurrentUserApi.auth().then(function(user) {

          if (!user.isLoggedIn) {
            return $q.reject('You need to be login.');
          }

          selector = {
            students: null,
            selectedId: null,
            available: false
          };

          if (user.isStudent) {
            selector.selectedId = user.id;
          }

          if (user.isStaff || user.isAdmin) {
            selector.available = true;
            listStudents(selector);
          }

          return selector;
        })['finally'](function(){
          selectorPromise = null;
        });

        return selectorPromise;
      };
    }
  ])

  ;

})();

(function(){
  'use strict';

  angular.module('scdPortFolio.directives', ['scdPortFolio.services']).

    directive('scdPfBars', ['scdPfSvgLayout', '$window', function(layout, window) {
      return {
        restrict: 'E',
        templateUrl: 'views/scdashboard/charts/bars.html',
        scope: {
          'data': '=scdPfData',
          'width': '&scdPfWidth',
          'height': '&scdPfHeight'
        },
        link: function(scope) {
          var onDataChange, d3 = window.d3;

          scope.layout = layout(
            {top: 10, right: 10, bottom:70, left: 60},
            scope.width(),
            scope.height()
          );

          onDataChange = function() {
            if (!scope.data) {
              return;
            }

            scope.xScale = d3.scale.ordinal();
            scope.xSubScale = d3.scale.ordinal();
            scope.yScale = d3.scale.linear();

            // set domains
            scope.data.data.forEach(function(type){
              scope.xScale(type.name);
            });
            scope.xSubScale = scope.xSubScale.domain(['value', 'mean']);
            scope.yScale = scope.yScale.domain([0, 1]);

            // set ranges
            scope.xScale = scope.xScale.rangeBands([0, scope.layout.innerWidth], 0, 0);
            scope.xSubScale = scope.xSubScale.rangeBands(
              [0, scope.layout.innerWidth/scope.xScale.domain().length], 0, 1)
            ;
            scope.legendScale = scope.xSubScale.copy().rangeBands([0, scope.layout.innerWidth], 0.1, 1);
            scope.yScale = scope.yScale.range([0, scope.layout.innerHeight]).nice();
            scope.yAxisScale = scope.yScale.copy().range([scope.layout.innerHeight, 0]).nice();

            // Translate legend name
            scope.translate = function(fieldName) {
              var t = {'value': 'You', 'mean': 'All others'};
              return t[fieldName] ? t[fieldName] : fieldName;
            };
          };

          scope.$watch('data', onDataChange);
        }
      };
    }])

  ;

})();
