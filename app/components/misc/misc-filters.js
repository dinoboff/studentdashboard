(function() {
  'use strict';

  angular.module('scdMisc.filters', []).

  filter('fullName', function() {
    return function(obj) {
      return obj.firstName + ' ' + obj.lastName;
    };
  }).

  filter('percent',  ['$window', function(window){
    var d3 = window.d3,
      formatter = d3.format('.00%');

    return function(v) {
      return formatter(v);
    };
  }]).

  filter('dash', function(){
    return function(v) {
      return v.replace(' ', '-');
    };
  }).


  filter('isEmpty', function(){
    return function(o){
      return !o || Object.keys(o).length === 0;
    };
  })

  ;

})();