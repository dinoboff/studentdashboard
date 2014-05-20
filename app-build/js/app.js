(function() {
  'use strict';

  angular.module('scDashboard', [
    'ngRoute',
    'scDashboard.controllers',
    'scdRepository.controllers',
    'scdReview.controllers'
  ]).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.

        when('/', {
          templateUrl: 'views/scdashboard/repository.html',
          controller: 'scdRepositoryListCtrl'
        }).

        when('/review', {
          templateUrl: 'views/scdashboard/review.html',
          controller: 'scdReviewCtrl'
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

      $scope.isActive = function(route) {
        return route === $location.path();
      };

      currentUserApi.auth().then(function(user) {
        $scope.currentUser = user;
      });
    }
  ]).

  controller('scdHomeCtrl', ['$scope',

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

  angular.module(
    'scdRepository.controllers', [
      'scdRepository.services',
      'scceStudents.services',
      'scceUser.services',
      'scDashboard.services',
      'angularFileUpload',
      'scdRepository.directives'
    ]
  ).

  controller('scdRepositoryListCtrl', ['$scope', 'scdRepositoryApi', 'scceStudentsApi', 'scceCurrentUserApi', '$q',
    function($scope, scdRepositoryApi, scceStudentsApi, scceCurrentUserApi, $q) {
      $scope.currentUser = null;
      $scope.files = null;
      $scope.showStudentSelector = false;
      $scope.selected = {};
      $scope.students = null;

      scceCurrentUserApi.auth().then(function(user) {
        if (user.error) {
          $scope.error = 'You need to be logged to list a repository';
          $scope.files = [];
          return $q.reject('You need to be logged to list a repository');
        }

        $scope.currentUser = user;
        if (!user.staffId && !user.isAdmin) {
          $scope.listFile(user.id);
          return user;
        }

        $scope.showStudentSelector = true;
        $scope.files = [];
        listStudent();
        return user;
      });

      function listStudent() {
        return scceStudentsApi.all().then(function(studentList) {
          $scope.students = studentList;
        });
      }

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
        scdRepositoryApi.newUploadUrl($scope.selected.student.id).then(function(uploadInfo) {
          $scope.upload = $upload.upload({
            url: uploadInfo.url,
            method: 'POST',
            withCredentials: true,
            data: {
              name: $scope.fileMeta.name || file.name,
              docType: $scope.fileMeta.docType,
              destId: $scope.selected.student.id
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

  angular.module('scdReview.services', []).

  factory('scdReviewApi', ['$window', '$q',
    function(window, $q) {
      var _ = window._,
        users = _.range(1, 61).map(function(index) {
          return newUser(index, _);
        }),
        average = calcOverallAverage(users, _);

      return {
        categories: ['All Categories'].concat(categories),
        residents: [{'title': 'All Residents', 'id': ''}].concat(residents),
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
              review: {
                overallAverage: average,
                students: pool.slice(start, end)
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
        }
      };
    }
  ])

  ;

})();