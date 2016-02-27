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
    weight: 135
  });
  item.history.push({
    id: 1,
    age: 10,
    height: 33,
    name: 'red',
    weight: 152
  });
  $scope.values.push(item);
  item = {
    id: 123,
    age: 3,
    height: 56,
    name: 'green',
    weight: 135,
    sourceType: 'EXTERNAL'
  };
  item.history = [];
  item.history.push({
    id: 3,
    age: 12,
    height: 56,
    name: 'green',
    weight: 111
  });
  item.history.push({
    id: 2,
    age: 13,
    height: 23,
    name: 'green',
    weight: 123
  });
  item.history.push({
    id: 1,
    age: 14,
    height: 65,
    name: 'green',
    weight: 135
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
    weight: 121
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
      records: "=values"
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
    controller: ['$scope', '$element', '$attrs', '$timeout', function(
      $scope, $element,
      $attrs, $timeout) {
      $scope.headers = [];
      $scope.element = $element;
      //.name, attrs.field, attrs.historyfield
      this.addHeader = function(attrs) {
        var headerObj = {};
        headerObj.headerName = attrs.headername;
        headerObj.field = attrs.field;
        headerObj.historyField = attrs.historyfield;
        headerObj.sortable = attrs.sortable;
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
        }
      }

      $scope.doSort = function(headerObj) {
        if (!headerObj.sortable) {
          return;
        }
        $scope.resetSortedFields();
        headerObj.sorted = true;

        $scope.records = $scope.records.sort(function(a, b) {
          if (a[headerObj.field] < b[headerObj.field]) {
            return -1;
          }
          if (a[headerObj.field] > b[headerObj.field]) {
            return 1;
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

      $scope.toggleHistoryClass = function($event) {
        var className = $event.currentTarget.className;
        if (className.indexOf("minus") != -1) {
          $("#" + $event.currentTarget.id).toggleClass(
            "glyphicon glyphicon-minus-sign", false);
          $("#" + $event.currentTarget.id).toggleClass(
            "glyphicon glyphicon-plus-sign", true);
        } else {
          $("#" + $event.currentTarget.id).toggleClass(
            "glyphicon glyphicon-plus-sign", false);
          $("#" + $event.currentTarget.id).toggleClass(
            "glyphicon glyphicon-minus-sign", true);
        }
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
            //$($event.currentTarget).tabNext();
          })
        }
      }
    }],
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
