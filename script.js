var app = angular.module('tableDirectiveModule', []);
app.controller('controller', ['$scope', function($scope) {
  $scope.name = 'Tobias';
  $scope.values = [];
  var item = {
    id: 232,
    age: 12,
    height: 56,
    name: 'red',
    weight: 135,
    sourceType: 'INTERNAL'
  };
  item.history = [];
  item.history.push({
    id: 2,
    age: 11,
    height: 22,
    name: 'red',
    weight: 135,
    sourceType: 'EXTERNAL'
  });
  item.history.push({
    id: 1,
    age: 10,
    height: 33,
    name: 'red',
    weight: 152,
    sourceType: 'EXTERNAL'
  });
  $scope.values.push(item);
  item = {
    id: 123,
    age: 3,
    height: 56,
    name: 'green',
    weight: 135,
    sourceType: 'EXTERNAL',
    childTemplate: 'childDetailsView.html'
  };
  item.history = [];
  item.history.push({
    id: 3,
    age: 12,
    height: 56,
    name: 'green',
    weight: 111,
    sourceType: 'EXTERNAL'
  });
  item.history.push({
    id: 2,
    age: 13,
    height: 23,
    name: 'green',
    weight: 123,
    sourceType: 'EXTERNAL'
  });
  item.history.push({
    id: 1,
    age: 14,
    height: 65,
    name: 'green',
    weight: 135,
    sourceType: 'EXTERNAL'
  });
  $scope.values.push(item);
  item = {
    id: 392,
    age: 19,
    height: 56,
    name: 'green',
    weight: 231,
    sourceType: 'AINTERNAL'
  };
  item.history = [];
  item.history.push({
    id: 1,
    age: 54,
    height: 56,
    name: 'green',
    weight: 121,
    sourceType: 'EXTERNAL'
  });
  $scope.values.push(item);
  item = {
    id: 393,
    age: 12,
    height: 52,
    name: 'black',
    weight: 123,
    sourceType: 'AEXTERNAL'
  };
  $scope.values.push(item);
  $scope.edit = function(x) {
    console.log("id: " + x.id);
  }
}]);


app.directive('histTable', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'tableTemplate.html',
    replace: false,
    priority: 0,
    scope: {
      records: "=values",
      childTemplate: "@childtemplate"
    },
    // compile: function compile(tElement, tAttrs, tTransclude) {
    //
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, crtl, transclude) {
    //         console.log("calling pre");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("calling post");
    //     }
    //   };
    // },
    controller: ['$scope', '$element', '$attrs', '$timeout',
      '$templateCache',
      function(
        $scope, $element,
        $attrs, $timeout,
        $templateCache) {
        $scope.headers = [];
        $scope.element = $element;
        //.name, attrs.field, attrs.historyfield
        this.addHeader = function(attrs) {
          var headerObj = {};
          headerObj.headerName = attrs.headername;
          headerObj.field = attrs.field;
          headerObj.historyField = attrs.historyfield;
          headerObj.sortable = attrs.sortable;
          headerObj.sortDirection = 1;
          headerObj.childTemplate = attrs.childtemplate;
          $scope.headers = jQuery.grep($scope.headers, function(item) {
            if (item.headerName != attrs.headername) {
              return true;
            }
          });
          $scope.headers.push(headerObj);
        }

        $scope.resetSortedFields = function() {
          for (var x = 0; x < $scope.headers.length; x++) {
            $scope.headers[x].sorted = false;
            $scope.headers[x].sortDirection = 1;
          }
        }

        $scope.doSort = function(headerObj) {
          if (!headerObj.sortable) {
            return;
          }
          if (headerObj.sorted) {
            headerObj.sortDirection = headerObj.sortDirection * -1;
          } else {
            $scope.resetSortedFields();
            headerObj.sorted = true;
          }

          $scope.records = $scope.records.sort(function(a, b) {
            if (a[headerObj.field] < b[headerObj.field]) {
              return -1 * headerObj.sortDirection;
            }
            if (a[headerObj.field] > b[headerObj.field]) {
              return 1 * headerObj.sortDirection;
            }
            return 0;
          });
        }

        $scope.call = function(functionName, arg) {
          $element.scope().$eval(functionName)(arg);
        }

        $scope.getHistoryValue = function(history, header) {
          return history[header.historyField];
        }

        $scope.toggleHistory = function($item, $event) {
          //$scope.toggleHistoryClass($event);
          if ($item.showChildren == undefined) {
            $item.showChildren = true;
            return;
          }
          $item.showChildren = !$item.showChildren;
        }

        $scope.processKey = function($event, $item) {
          if ($event.keyCode == 13) {
            $scope.toggleHistory($item, $event);
          }
        }
        $scope.processHeaderKeypress = function($event, headerObj) {
          if ($event.keyCode == 13) {
            $timeout(function() {
              $($event.currentTarget).trigger("click");
            })
          }
        }
        $scope.includeChildTemplate = function(headerObj) {

        }
      }
    ],
  }
});

app.directive('column', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<td ng-transclude> </td>',
    replace: true,
    require: '^^histTable',
    priority: 10,
    link: function(scope, element, attrs, tableCtrl) {
      tableCtrl.addHeader(attrs);
    }
  }
});

app.directive('historyToggle', function($templateCache) {
  return {
    restrict: 'E',
    require: '^^histTable',
    template: $templateCache.get("historyToggleColumn.html"),
    link: function(scope, element, attrs, tableCtrl) {;
    }
  }
});

app.directive('inject', function() {
  return {
    link: function($scope, $element, $attrs, controller, $transclude) {
      if (!$transclude) {
        throw minErr('ngTransclude')('orphan',
          'Illegal use of ngTransclude directive in the template! ' +
          'No parent directive that requires a transclusion found. ' +
          'Element: {0}',
          startingTag($element));
      }
      var innerScope = $scope.$new();
      $transclude(innerScope, function(clone) {
        $element.empty();
        $element.append(clone);
        $element.on('$destroy', function() {
          innerScope.$destroy();
        });
      });
    }
  };
});
