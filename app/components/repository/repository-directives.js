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